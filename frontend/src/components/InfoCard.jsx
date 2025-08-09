import React, { useState, useEffect } from "react";

export default function InfoCard() {
  const [hovered, setHovered] = useState(false);
  const [locked, setLocked] = useState(false);

  // Close on Esc key for accessibility
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape" && locked) {
        setLocked(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [locked]);

  // Show info if: hovered OR locked
  const infoVisible = hovered || locked;

  return (
    <div
      className="relative inline-block group"
      tabIndex={0}
      onMouseEnter={() => !locked && setHovered(true)}
      onMouseLeave={() => !locked && setHovered(false)}
      onFocus={() => !locked && setHovered(true)}
      onBlur={() => !locked && setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        setLocked((prev) => !prev);
        setHovered(false);
      }}
    >
      {/* Icon color now from theme's primary color */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className="h-10 w-10 shrink-0 stroke-current cursor-pointer"
        aria-label="Info about models"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {infoVisible && (
        <div
          className="
           absolute left-40 -translate-x-1/2 top-12 z-30
           max-w-xs w-max rounded-xl
           backdrop-blur-sm shadow-lg px-4 py-2
           text-left text-base font-medium animate-fade-down
           bg-[var(--color-infocard-bg)]
           border border-[var(--color-infocard-border)]
           text-[var(--color-base-content)]
         "
        >
          <div className="font-bold text-[var(--color-neutral)] text-sm mb-1 flex items-center justify-between">
            <span>Models:</span>
            {locked && (
              <button
                className="ml-3 text-lg font-bold text-blue-200 hover:text-red-300"
                aria-label="Close"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); setLocked(false); }}
              >
                &times;
              </button>
            )}
          </div>
          <ul className="space-y-3 text-left text-sm">
            <li>
              <div className="font-bold text-[var(--color-secondary)]">
                Perplexity <span className="font-bold text-s text-neutral">(Sonar)</span>
              </div>
              <div className="pl-1 text-[var(--color-base-content)] text-xs">
                Provides quick, grounded answers by connecting to the internet in real-time.
              </div>
            </li>
            <li>
              <div className="font-bold text-[var(--color-info)]">
                Gemini <span className="font-bold text-s text-neutral">(1.5 Flash)</span>
              </div>
              <div className="pl-1 text-[var(--color-base-content)] text-xs">
                Optimized for speed and scale in chat and on-demand content generation.
              </div>
            </li>
            <li>
              <div className="font-bold text-[var(--color-warning)]">
                DeepSeek <span className="font-bold text-s text-neutral">(R1)</span>
              </div>
              <div className="pl-1 text-[var(--color-base-content)] text-xs">
                Outstanding in mathematics, programming, and logical reasoning.
              </div>
            </li>
            <li>
              <div className="font-bold text-[var(--color-success)]">
                Qwen <span className="font-bold text-s text-neutral">(Qwen3 Coder)</span>
              </div>
              <div className="pl-1 text-[var(--color-base-content)] text-xs">
                A Mixture-of-Experts (MoE) model specialized for agentic coding tasks.
              </div>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
