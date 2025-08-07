import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MoodToggle from "../../src/components/MoodToggle";

describe("MoodToggle component", () => {
  test("renders both sun and moon icons", () => {
    render(<MoodToggle />);
    // Verify sun icon (swap-off) exists
    const sunIcon = screen.getByTestId("sun-icon");
    expect(sunIcon).toBeInTheDocument();

    // Verify moon icon (swap-on) exists
    const moonIcon = screen.getByTestId("moon-icon");
    expect(moonIcon).toBeInTheDocument();
  });

  test("checkbox toggles between sun and moon icons", () => {
  render(<MoodToggle />);
  const checkbox = screen.getByRole("checkbox");
  const sunIcon = screen.getByTestId("sun-icon");
  const moonIcon = screen.getByTestId("moon-icon");

  // Initially, checkbox is unchecked
  expect(checkbox.checked).toBe(false);

  // The icons have the expected classes when unchecked
  expect(sunIcon.classList.contains("swap-off")).toBe(true);
  expect(moonIcon.classList.contains("swap-on")).toBe(true);

  // When unchecked, sun icon is expected to be "active" (swap-off),
  // but you cannot rely on visibility in jest-dom without CSS.

  // Check the checkbox
  fireEvent.click(checkbox);
  expect(checkbox.checked).toBe(true);

  // After checking, the classes remain the same but
  // in a real browser the styles would toggle visibility.
  // Here we can only assert the checked prop on the checkbox.

  // If your component logic changes classes dynamically on toggle,
  // test those class changes here.

});


  test("tooltip is present on label", () => {
    render(<MoodToggle />);
    const label = screen.getByLabelText(/toggle theme/i) || screen.getByRole("checkbox").parentNode;
    expect(label).toHaveClass("tooltip");
  });
});
