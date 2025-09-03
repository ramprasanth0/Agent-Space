// InfoCard.jsx
// NOTE: This is the full, updated code using a React Portal to prevent
// the info card from being cut off by the header. (NEW)

import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom"; // Import ReactDOM for portals.

export default function InfoCard() {
  const [hovered, setHovered] = useState(false);
  const [locked, setLocked] = useState(false);

  // This state will hold the screen coordinates for the portal.
  const [cardCoords, setCardCoords] = useState({ top: 0, left: 0 });
  const containerRef = useRef(null);

  // Close on Esc key for accessibility.
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape" && locked) {
        setLocked(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [locked]);

  const infoVisible = hovered || locked;

  // This effect calculates the absolute screen coordinates for the portal.
  useEffect(() => {
    if (infoVisible && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      
      // Position the card centered horizontally with the icon, 8px below it.
      const top = rect.bottom + window.scrollY + 8;
      const left = rect.left + window.scrollX + (rect.width / 2);

      setCardCoords({ top, left });
    }
  }, [infoVisible]);

  // This is the JSX for the info card content, which will be rendered in the portal.
  const InfoCardContent = (
    <div
      style={{
        position: 'absolute',
        top: `${cardCoords.top}px`,
        left: `${cardCoords.left}px`,
        transform: 'translateX(-5%)', // This keeps the card centered on the icon.
      }}
      className={`
        z-50 max-w-xs w-max rounded-xl
        backdrop-blur-sm shadow-lg px-4 py-2
        text-left text-base font-medium animate-fade-down
        bg-[var(--color-infocard-bg)]
        border border-[var(--color-infocard-border)]
        text-[var(--color-base-content)]
      `}
    >
      <div className="font-bold text-[var(--color-neutral)] text-sm mb-1 flex items-center justify-between">
        <span>Info:</span>
        {locked && (
          <button
            className="ml-3 text-lg font-bold text-blue-200 hover:text-red-300"
            aria-label="Close"
            onClick={(e) => { e.stopPropagation(); setLocked(false); }}
          >
            &times;
          </button>
        )}
      </div>
      <div className="mb-3">
        <span>Modes :</span>
        <ul className="space-y-1 text-left text-sm">
          <li>
            <div className="font-bold text-[var(--color-secondary)]">
              One-Liner <span className="font-bold text-s text-neutral">(Provided quick and efficient sol - No memory)</span>
            </div>
          </li>
          <li>
            <div className="font-bold text-[var(--color-secondary)]">
              Conversation <span className="font-bold text-s text-neutral">(Provided tailored solution - has memory)</span>
            </div>
          </li>
        </ul>
      </div>
      <div>
        <span>Models :</span>
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
    </div>
  );

  return (
    <div
      ref={containerRef}
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
      {/* Icon remains the same */}
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
      
      {/* Use the portal to render the info card content. */}
      {infoVisible && ReactDOM.createPortal(
        InfoCardContent,
        document.getElementById('portal-root')
      )}
    </div>
  );
}
