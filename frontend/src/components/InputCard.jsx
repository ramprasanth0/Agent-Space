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

export default function InputCard({ hasStartedChat, input, loading, setInput, handleClick }) {
  const textareaRef = useRef();

  // Autosize textarea on input change
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto"; // Reset height for scrollHeight calculation
      el.style.height = Math.min(el.scrollHeight, 120) + "px"; // Limit max height
    }
  }, [input]);

  // Animated placeholder cycling through prompts
  const animatedPlaceholder = useAnimatedPlaceholder(PLACEHOLDERS, 1000);

  return (
    <div className="p-6 w-full">
      <label
        htmlFor="inputcard-input"
        className="flex items-center font-medium gap-2 mb-4"
      >
        <div className="shrink-0">Your Unhinged Queries:</div>
        <textarea
          ref={textareaRef}
          id="inputcard-input"
          className="resize-none w-3/4 bg-black text-white px-3 pr-2 block py-2 rounded-xl bg-center focus:outline-none focus:ring-4 focus:ring-purple-800 transition"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
          data-testid="inputcard-input"
          placeholder={hasStartedChat ? "Ask anything..." : animatedPlaceholder}
          aria-label="User input"
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey && !loading && input.trim()) {
              e.preventDefault();
              handleClick(e);
            }
          }}
          rows={1}
          style={{ maxHeight: 120, overflow: "auto", minHeight: 40 }} // Stops growing at 120px height
        />
      </label>
    </div>
  );
}
