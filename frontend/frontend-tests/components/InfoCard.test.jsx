import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import InfoCard from "../../src/components/InfoCard";

describe("InfoCard", () => {
  test("renders info icon SVG with appropriate aria-label", () => {
    render(<InfoCard />);
    const svg = screen.getByLabelText(/info about models/i);
    expect(svg).toBeInTheDocument();
    // Use lowercase 'svg' as JSDOM returns lowercase tagName
    expect(svg.tagName).toBe("svg");
  });

  test("info popup is not visible initially", () => {
    render(<InfoCard />);
    const infoPopup = screen.queryByText(/Perplexity/i); // some unique text inside popup
    expect(infoPopup).not.toBeInTheDocument();
  });

  test("shows info popup on mouse enter and hides on mouse leave when not locked", () => {
    render(<InfoCard />);
    const container = screen.getByLabelText(/info about models/i).parentElement;

    // mouse enter to show
    fireEvent.mouseEnter(container);
    expect(screen.getByText(/Perplexity/i)).toBeInTheDocument();

    // mouse leave to hide
    fireEvent.mouseLeave(container);
    expect(screen.queryByText(/Perplexity/i)).not.toBeInTheDocument();
  });

  test("shows info popup on focus and hides on blur when not locked", () => {
    render(<InfoCard />);
    const container = screen.getByLabelText(/info about models/i).parentElement;

    fireEvent.focus(container);
    expect(screen.getByText(/Perplexity/i)).toBeInTheDocument();

    fireEvent.blur(container);
    expect(screen.queryByText(/Perplexity/i)).not.toBeInTheDocument();
  });

  test("locks info popup on click and unlocks on next click", () => {
    render(<InfoCard />);
    const container = screen.getByLabelText(/info about models/i).parentElement;

    // Click to lock
    fireEvent.click(container);
    expect(screen.getByText(/Perplexity/i)).toBeInTheDocument();

    // After locked, mouse leave does NOT hide popup
    fireEvent.mouseLeave(container);
    expect(screen.getByText(/Perplexity/i)).toBeInTheDocument();

    // Click again to unlock
    fireEvent.click(container);
    expect(screen.queryByText(/Perplexity/i)).not.toBeInTheDocument();
  });

  test("shows close button only when locked and closes popup on clicking it", () => {
    render(<InfoCard />);
    const container = screen.getByLabelText(/info about models/i).parentElement;

    // Lock popup by clicking
    fireEvent.click(container);
    const closeButton = screen.getByRole("button", { name: /close/i });
    expect(closeButton).toBeInTheDocument();

    // Click close button to unlock
    fireEvent.click(closeButton);
    expect(screen.queryByText(/Perplexity/i)).not.toBeInTheDocument();
  });

  test("closes info popup on Escape key press when locked", () => {
    render(<InfoCard />);
    const container = screen.getByLabelText(/info about models/i).parentElement;

    // Lock popup first
    fireEvent.click(container);
    expect(screen.getByText(/Perplexity/i)).toBeInTheDocument();

    // Press Escape key
    fireEvent.keyDown(container, { key: "Escape" });
    expect(screen.queryByText(/Perplexity/i)).not.toBeInTheDocument();
  });

  test("does not close info popup on Escape key press when not locked", () => {
    render(<InfoCard />);
    const container = screen.getByLabelText(/info about models/i).parentElement;

    // Show popup by focus
    fireEvent.focus(container);
    expect(screen.getByText(/Perplexity/i)).toBeInTheDocument();

    // Press Escape key (should not close because not locked)
    fireEvent.keyDown(container, { key: "Escape" });
    expect(screen.getByText(/Perplexity/i)).toBeInTheDocument();
  });
});
