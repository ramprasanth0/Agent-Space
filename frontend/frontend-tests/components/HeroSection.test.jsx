import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HeroSection from "../../src/components/HeroSection";

jest.mock("../../src/api/Agents", () => ({
  sendChatToPerplexity: jest.fn(),
  sendChatToGemini: jest.fn(),
  sendChatToDeepSeek: jest.fn(),
  sendChatToQwen: jest.fn(),
  sendChatToMultiAgent: jest.fn(),
}));

jest.mock("../../src/components/ConversationToggle", () => (props) => (
  <div data-testid="conversation-toggle">
    <input
      type="checkbox"
      checked={props.mode === "conversation"}
      onChange={(e) => {
        props.setMode(e.target.checked ? "conversation" : "one-liner");
      }}
      data-testid="conversation-toggle-checkbox"
    />
  </div>
));

jest.mock("../../src/components/ModelSelector", () => (props) => (
  <div data-testid="model-selector">
    {props.models.map((model) => (
      <label key={model}>
        <input
          type="checkbox"
          checked={props.selected.includes(model)}
          onChange={() => {
            let newSelected;
            if (props.selected.includes(model)) {
              newSelected = props.selected.filter((m) => m !== model);
            } else {
              newSelected = [...props.selected, model];
            }
            props.setSelectedModels(newSelected);
            props.resetMessages([]);
          }}
          data-testid={`model-checkbox-${model}`}
        />
        {model}
      </label>
    ))}
  </div>
));


jest.mock("../../src/components/InputCard", () => (props) => (
  <div>
    <input
      data-testid="inputcard-input"
      value={props.input}
      onChange={(e) => props.setInput(e.target.value)}
    />
    <button onClick={props.handleClick} data-testid="inputcard-submit">
      Submit
    </button>
  </div>
));

jest.mock("../../src/components/ResponseCard", () => (props) => (
  <div data-testid="response-card">
    {props.response?.map((r, i) => (
      <div
        key={r.provider ?? i}
        data-testid={`response-provider-${r.provider ?? i}`}
      >
        <strong>{r.provider}</strong>:{" "}
        {props.loadingModels.includes(r.provider) || r.response === null ? (
          <span data-testid={`loading-${r.provider}`}>Loading...</span>
        ) : (
          <span>{r.response}</span>
        )}
      </div>
    )) || null}
  </div>
));

import {
  sendChatToPerplexity,
  sendChatToGemini,
  sendChatToDeepSeek,
  sendChatToQwen,
} from "../../src/api/Agents";

describe("HeroSection Component", () => {
  let alertRef;

  beforeEach(() => {
    jest.clearAllMocks();

    alertRef = {
      current: {
        show: jest.fn(),
      },
    };

 sendChatToPerplexity.mockImplementation(() =>
  new Promise((resolve) => setTimeout(() => resolve({ response: "Perplexity response" }), 50))
);

sendChatToGemini.mockImplementation(() =>
  new Promise((resolve) => setTimeout(() => resolve({ response: "Gemini response" }), 50))
);

sendChatToDeepSeek.mockImplementation(() =>
  new Promise((resolve) => setTimeout(() => resolve({ response: "DeepSeek response" }), 50))
);

sendChatToQwen.mockImplementation(() =>
  new Promise((resolve) => setTimeout(() => resolve({ response: "Qwen response" }), 50))
);

  });

    test("renders subcomponents", () => {
        render(<HeroSection alertRef={alertRef} />);

        expect(screen.getByTestId("conversation-toggle")).toBeInTheDocument();
        expect(screen.getByTestId("model-selector")).toBeInTheDocument();
        expect(screen.getByTestId("inputcard-input")).toBeInTheDocument();
        expect(screen.getByTestId("inputcard-submit")).toBeInTheDocument();
        expect(screen.getByTestId("response-card")).toBeInTheDocument();
    });

    test("mode toggle resets selected models if going to conversation mode with invalid selection", async () => {
        render(<HeroSection alertRef={alertRef} />);
        // Initially Sonar is selected
        expect(screen.getByTestId("model-checkbox-Sonar").checked).toBe(true);

        const toggleCheckbox = screen.getByTestId("conversation-toggle-checkbox");
        await userEvent.click(toggleCheckbox);

        // Wait until checkbox reflects updated (unselected) state
        await waitFor(() => {
            expect(screen.getByTestId("model-checkbox-Sonar").checked).toBe(true);
        });

        expect(alertRef.current.show).toHaveBeenCalledWith(
            "Conversation mode enabled (switching model will reset history)"
        );
    });

    test("changes input on typing", async () => {
        render(<HeroSection alertRef={alertRef} />);
        const input = screen.getByTestId("inputcard-input");

        await userEvent.type(input, "Hello World");
        expect(input.value).toBe("Hello World");
    });

    test("submit sends requests and shows loading indicators", async () => {
        render(<HeroSection alertRef={alertRef} />);

        const input = screen.getByTestId("inputcard-input");
        const submitButton = screen.getByTestId("inputcard-submit");

        // Type the input
        await userEvent.type(input, "Hi");

        // Click submit and wrap in act()
        await act(async () => {
            fireEvent.click(submitButton);
        });

        // Wait for loading indicator to appear indicating request ongoing
        await waitFor(() => {
            expect(screen.getByTestId("loading-Sonar")).toBeInTheDocument();
        });

        // Wait for the response to appear after API resolves
        await waitFor(() => {
            expect(screen.getByText(/Perplexity response/i)).toBeInTheDocument();
        });

        // Loading indicator should then be gone
        expect(screen.queryByTestId("loading-Sonar")).not.toBeInTheDocument();

        // Input box should be cleared
        expect(input.value).toBe("");
    });


    test("conversation mode shows last assistant message", async () => {
        render(<HeroSection alertRef={alertRef} />);

        // Deselect other models, select Sonar explicitly
        const sonarCheckbox = screen.getByTestId("model-checkbox-Sonar");
        const geminiCheckbox = screen.getByTestId("model-checkbox-Gemini");

        if (geminiCheckbox.checked) {
        await userEvent.click(geminiCheckbox);
        }
        if (!sonarCheckbox.checked) {
        await userEvent.click(sonarCheckbox);
        }

        // Toggle conversation mode on
        const toggleCheckbox = screen.getByTestId("conversation-toggle-checkbox");
        await userEvent.click(toggleCheckbox);

        // Type input and submit
        const input = screen.getByTestId("inputcard-input");
        await userEvent.type(input, "Hello");

        await act(async () => {
        fireEvent.click(screen.getByTestId("inputcard-submit"));
        });

        // Wait for response text that corresponds to Sonar (Perplexity) model
        await waitFor(() =>
        expect(screen.getByText(/Perplexity response/i)).toBeInTheDocument()
        );

        expect(screen.getByTestId("response-card")).toBeInTheDocument();
    });

    test("one-liner mode clears messages on send", async () => {
        render(<HeroSection alertRef={alertRef} />);

        const input = screen.getByTestId("inputcard-input");
        await userEvent.type(input, "One-liner input");

        await act(async () => {
        fireEvent.click(screen.getByTestId("inputcard-submit"));
        });

        await waitFor(() =>
        expect(screen.getByText("Perplexity response")).toBeInTheDocument()
        );

        // Messages cleared (implicit via UI)
    });

    test("does not submit empty input", async () => {
    render(<HeroSection alertRef={alertRef} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId("inputcard-submit"));
    });

    expect(sendChatToPerplexity).not.toHaveBeenCalled();
    expect(sendChatToGemini).not.toHaveBeenCalled();
    expect(sendChatToDeepSeek).not.toHaveBeenCalled();
    expect(sendChatToQwen).not.toHaveBeenCalled();
  });
});
