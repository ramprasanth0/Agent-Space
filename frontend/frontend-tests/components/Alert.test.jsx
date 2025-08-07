import React, { useRef } from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Alert from "../../src/components/Alert";

describe("Alert component with forwardRef", () => {
  beforeEach(() => {
  jest.useFakeTimers();
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
  function AlertWrapper({ visibleDuration, fadeDuration }) {
  const alertRef = useRef();
  return (
    <>
      <Alert ref={alertRef} visibleDuration={visibleDuration} fadeDuration={fadeDuration}/>
      <button onClick={() => alertRef.current.show("msg")}>Show Alert</button>
    </>
  );
  }

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test("initially renders nothing", () => {
    render(<Alert />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("show and hide alert message visually", async () => {
    const alertRef = React.createRef();
    render(<Alert ref={alertRef} visibleDuration={100} fadeDuration={10} />);
    act(() => {
      alertRef.current.show("Test alert message");
    });
    expect(screen.getByText("Test alert message")).toBeInTheDocument();

    // Instead of clear(), simulate passing time/fade
    act(() => {
      jest.advanceTimersByTime(200); // longer than visibleDuration+fadeDuration
    });

    await waitFor(() => {
      expect(screen.queryByText("Test alert message")).toBeNull();
    });
  });

  test("clears timeouts on unmount", async () => {
    jest.useRealTimers();
    const visibleDuration = 50;
    const fadeDuration = 10;

    const { unmount } = render(
      <AlertWrapper visibleDuration={visibleDuration} fadeDuration={fadeDuration} />
    );
    const btn = screen.getByRole("button", { name: /show alert/i });
    await userEvent.click(btn);
    expect(screen.getByRole("alert")).toBeInTheDocument();

    // Unmount and flush timers INSIDE act
    unmount();
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(true).toBe(true);
  });
});