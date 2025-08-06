import { useState } from "react";

export default function InfoCard() {
  const [hovered, setHovered] = useState(false);
  const [locked, setLocked] = useState(false);

  // Close on Esc key for accessibility
  function onKeyDown(e) {
    if (e.key === "Escape" && locked) setLocked(false);
  }

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
      onKeyDown={onKeyDown}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className="h-10 w-10 shrink-0 stroke-current cursor-pointer text-violet-600 dark:text-indigo-200"
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
            max-w-xs w-max
            rounded-xl
            bg-white/80 dark:bg-indigo-950/80
            backdrop-blur-sm
            border border-white/30 dark:border-indigo-900/30
            shadow-lg
            px-4 py-2
            text-left
            text-base
            text-indigo-900 dark:text-indigo-100
            font-medium
            animate-fade-down
          "
        >
          <div className="font-bold text-violet-700 dark:text-indigo-200 text-sm mb-1 flex items-center justify-between">
            <span>Models:</span>
            {locked &&
              // Close button shown only when "locked" by click
              <button
                className="ml-3 text-lg font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white"
                aria-label="Close"
                tabIndex={0}
                onClick={e => { e.stopPropagation(); setLocked(false); }}
              >
                &times;
              </button>
            }
          </div>
            <ul className="space-y-3 text-left text-sm">
                <li>
                    <div className="font-bold text-violet-700 dark:text-violet-300">
                        Perplexity <span className="font-bold text-s text-slate-500">(Sonar)</span>
                    </div>
                    <div className="pl-1 text-slate-800 dark:text-slate-200 text-xs">
                        Provides quick, grounded answers by connecting to the internet in real-time, ensuring the latest information from trusted sources.
                    </div>
                </li>
                <li>
                    <div className="font-bold text-cyan-700 dark:text-cyan-200">
                        Gemini <span className="font-bold text-s text-slate-500">(1.5 Flash)</span>
                    </div>
                    <div className="pl-1 text-slate-800 dark:text-slate-200 text-xs">
                        Optimized for chat assistants and on-demand content generation where speed and scale are essential.
                    </div>
                </li>
                <li>
                    <div className="font-bold text-yellow-600 dark:text-yellow-200">
                        DeepSeek <span className="font-bold text-s text-slate-500">(R1)</span>
                    </div>
                    <div className="pl-1 text-slate-800 dark:text-slate-200 text-xs">
                        Outstanding on benchmarks in mathematics, programming, and logic; ideal for technical reasoning.
                    </div>
                </li>
                <li>
                    <div className="font-bold text-emerald-700 dark:text-emerald-200">
                        Qwen <span className="font-bold text-s text-slate-500">(Qwen3 Coder)</span>
                    </div>
                    <div className="pl-1 text-slate-800 dark:text-slate-200 text-xs">
                        A Mixture-of-Experts (MoE) model specialized for agentic coding tasks, including function calling, tool use, and long-context reasoning over codebases.
                    </div>
                </li>
            </ul>
        </div>
      )}
    </div>
  );
}