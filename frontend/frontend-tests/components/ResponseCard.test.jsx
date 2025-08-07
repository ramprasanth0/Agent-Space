import React from "react";
import { render, screen } from "@testing-library/react";
import ResponseCard from "../../src/components/ResponseCard";

describe("ResponseCard", () => {
  test("renders null if response is not array or empty", () => {
    const { container: c1 } = render(<ResponseCard response={null} loadingModels={[]} />);
    expect(c1.firstChild).toBeNull();

    const { container: c2 } = render(<ResponseCard response={[]} loadingModels={[]} />);
    expect(c2.firstChild).toBeNull();

    const { container: c3 } = render(<ResponseCard response="string" loadingModels={[]} />);
    expect(c3.firstChild).toBeNull();
  });

  test.each([
    [1, "grid-cols-1"],
    [2, "grid-cols-2"],
    [3, "grid-cols-3"],
    [4, "grid-cols-4"],
    [5, "grid-cols-1"], // fallback for >4
  ])("applies correct grid-cols class for %i responses", (count, expectedClass) => {
    const response = Array.from({ length: count }, (_, i) => ({
      provider: `provider${i + 1}`,
      response: `response text ${i + 1}`,
    }));

    render(<ResponseCard response={response} loadingModels={[]} />);
    const container = screen.getByTestId("response-card-grid");

    expect(container).toHaveClass(expectedClass);
  });

  test("renders provider names and responses correctly", () => {
    const response = [
      { provider: "Alpha", response: "Alpha response" },
      { provider: "Beta", response: "Beta response" },
    ];

    render(<ResponseCard response={response} loadingModels={[]} />);

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();

    expect(screen.getByText("Alpha response")).toBeInTheDocument();
    expect(screen.getByText("Beta response")).toBeInTheDocument();
  });

  test("shows loading skeletons if provider is in loadingModels or response is null", () => {
  const response = [
    { provider: "Alpha", response: "Some answer" },
    { provider: "Beta", response: null },
    { provider: "Gamma", response: "Answer" },
  ];

  const loadingModels = ["Alpha", "Gamma"];

  render(<ResponseCard response={response} loadingModels={loadingModels} />);

  const skeletons = document.querySelectorAll(".skeleton");
  expect(skeletons.length).toBeGreaterThanOrEqual(6); // 3 skeleton divs × 2 loading providers

  // Response texts for loading providers should NOT be rendered
  expect(screen.queryByText("Some answer")).not.toBeInTheDocument();
  expect(screen.queryByText("Answer")).not.toBeInTheDocument();

  // For Beta (null response), skeleton should be shown, and no response text present
  const betaResponse = screen.queryByText("Beta response");
  expect(betaResponse).not.toBeInTheDocument();

  // Instead of checking empty string text, confirm last div for Beta is a skeleton container:
  const betaProviderDiv = screen.getByText("Beta").parentElement;
  const betaSkeletonDiv = betaProviderDiv.querySelector(".skeleton");
  expect(betaSkeletonDiv).toBeInTheDocument();
});


  test("renders response text when not loading and response not null", () => {
    const response = [{ provider: "Alpha", response: "Alpha answer" }];
    const loadingModels = [];

    render(<ResponseCard response={response} loadingModels={loadingModels} />);

    expect(screen.getByText("Alpha answer")).toBeInTheDocument();

    // No skeletons should be rendered
    const skeleton = document.querySelector(".skeleton");
    expect(skeleton).toBeNull();
  });

  test("uses key as provider or index if provider is absent", () => {
    const response = [
      { provider: undefined, response: "No provider response" },
      { provider: "Beta", response: "Beta response" },
    ];

    render(<ResponseCard response={response} loadingModels={[]} />);

    expect(screen.getByText("No provider response")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });
});
