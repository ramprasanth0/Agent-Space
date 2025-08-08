import React, { useRef, useEffect } from "react";
import useAnimatedPlaceholder from "./useAnimatedPlaceholder";


const PLACEHOLDERS = [
  "Is gravity real?!",
  "What is the meaning of life?🤔",
  "r u going to takeover the planet?😬",
  "Suggest me a movie🍿",
  "Why do cats stare at walls?",
  "Do penguins have knees?",
  "Code a custom chess game",
  "Teach me to time travel! 🚋",
  "Can robots love?❤️",
  "Do fish get thirsty?🙂",
  "Tell me a joke",
  "Convince me unicorns are real.🦄",
  "Is water wet?",
  "What happens if you divide by zero?",
];


export default function InputCard({ input, loading, setInput, handleClick }) {
  const textareaRef = useRef();

  // Autosize on input change
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto"; // Reset height so scrollHeight is correct
      // Limit (e.g. 120px; adjust as needed)
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  }, [input]);

  // setting up the animated placeholder
  const animatedPlaceholder = useAnimatedPlaceholder(PLACEHOLDERS, 1000);

  return (
    <div className="p-6 w-full">
      <label
        htmlFor="inputcard-input"
        className="text-purpureus-900 flex items-center font-medium gap-2 mb-4"
      >
        <div className="shrink-0">Your Unhinged Queries:</div>
        <textarea
          ref={textareaRef}
          id="inputcard-input"
          className="resize-none w-3/4 bg-black text-white px-3 pr-2 block py-2 rounded-xl bg-center focus:outline-none focus:ring-4 focus:ring-purple-800 transition"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          data-testid="inputcard-input"
          placeholder={animatedPlaceholder}
          aria-label="User input"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !loading && input.trim()) {
              e.preventDefault();
              handleClick(e);
            }
          }}
          rows={1}
          style={{ maxHeight: 120, overflow: "auto", minHeight: 40 }} // stops growing at 120px height
        />
      </label>
      <button
        className="mt-4 w-full bg-secondary text-black rounded-full py-2 hover:bg-secondary-content hover:text-white transition"
        onClick={handleClick}
        disabled={loading || !input.trim()}
        data-testid="inputcard-submit"
        aria-label="Submit query"
        type="button"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Loading...
          </span>
        ) : (
          "Go!"
        )}
      </button>
    </div>
  );
}