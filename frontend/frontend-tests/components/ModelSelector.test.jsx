import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ModelSelector from "../../src/components/ModelSelector";

describe("ModelSelector", () => {
  const models = ["Sonar", "R1", "Gemini", "Qwen"];

  test("renders buttons for all models with correct icons and names", () => {
    render(
      <ModelSelector
        models={models}
        selected={[]}
        setSelectedModels={() => {}}
        mode="other"
        resetMessages={() => {}}
      />
    );

    models.forEach((model) => {
      const button = screen.getByRole("button", { name: new RegExp(model, "i") });
      expect(button).toBeInTheDocument();
      const img = button.querySelector("img");
      expect(img).toHaveAttribute("alt", `${model} icon`);
      expect(img).toHaveAttribute("src");
    });
  });

  test("supports multi-select toggling when mode is NOT 'conversation'", () => {
    const setSelectedModels = jest.fn();
    const selected = ["Sonar", "Qwen"];
    render(
      <ModelSelector
        models={models}
        selected={selected}
        setSelectedModels={setSelectedModels}
        mode="other"
        resetMessages={() => {}}
      />
    );

    // Click an already selected model toggles it off
    fireEvent.click(screen.getByRole("button", { name: /Sonar/i }));
    expect(setSelectedModels).toHaveBeenCalledWith(selected.filter((m) => m !== "Sonar"));

    // Click an unselected model toggles it on
    fireEvent.click(screen.getByRole("button", { name: /R1/i }));
    expect(setSelectedModels).toHaveBeenCalledWith([...selected, "R1"]);
  });

  test("only allows single select when mode is 'conversation' and resets messages", () => {
    const setSelectedModels = jest.fn();
    const resetMessages = jest.fn();
    const selected = ["Sonar"];
    render(
      <ModelSelector
        models={models}
        selected={selected}
        setSelectedModels={setSelectedModels}
        mode="conversation"
        resetMessages={resetMessages}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Gemini/i }));

    expect(setSelectedModels).toHaveBeenCalledWith(["Gemini"]);
    expect(resetMessages).toHaveBeenCalledWith([]);
  });

  test("button styles change based on selection", () => {
    const { rerender } = render(
      <ModelSelector
        models={models}
        selected={["Sonar"]}
        setSelectedModels={() => {}}
        mode="other"
        resetMessages={() => {}}
      />
    );

    const sonarButton = screen.getByRole("button", { name: /Sonar/i });
    const r1Button = screen.getByRole("button", { name: /R1/i });
    
    // Selected button has 'bg-tekhelet-900' and 'text-black' classes
    expect(sonarButton.className).toMatch(/bg-tekhelet-900/);
    expect(sonarButton.className).toMatch(/text-black/);
    
    // Unselected button has 'bg-oxford_blue-500' and 'text-white' classes
    expect(r1Button.className).toMatch(/bg-oxford_blue-500/);
    expect(r1Button.className).toMatch(/text-white/);

    // Change selection and verify rerender
    rerender(
      <ModelSelector
        models={models}
        selected={["R1"]}
        setSelectedModels={() => {}}
        mode="other"
        resetMessages={() => {}}
      />
    );

    expect(screen.getByRole("button", { name: /R1/i }).className).toMatch(/bg-tekhelet-900/);
  });
});
