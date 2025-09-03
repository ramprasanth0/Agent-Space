import React from "react";

import deepSeek from '../assets/deepseek.svg';
import gemini from '../assets/gemini.svg';
import perplexity from '../assets/perplexity.svg';
import qwen from '../assets/qwen.svg';

export default function ModelSelector({
    models,
    selected,
    setSelectedModels,
    mode,
    resetMessages
}) {
    const modelIcons = {
        Sonar: perplexity,
        R1: deepSeek,
        Gemini: gemini,
        Qwen: qwen,
    };

    function toggleModel(model) {
        if (mode === "conversation") {
            // Only one model allowed
            setSelectedModels([model]);
            resetMessages([]);
        } else {
            // Multi-select
            if (selected.includes(model)) {
                setSelectedModels(selected.filter(m => m !== model));
            } else {
                setSelectedModels([...selected, model]);
            }
        }
    }

    return (
    <div
      className="
        bg-[var(--color-neutral)] my-3 mr-3 ml-2 rounded-full flex gap-2 p-2 justify-center
        max-sm:my-0 max-sm:mx-1 max-sm:gap-1 max-sm:p-2
      "
    >
      {models.map((m) => {
        const isSelected = selected.includes(m);
        return (
          <button
            type="button"
            key={m}
            onClick={() => toggleModel(m)}
            className={`
              flex items-center rounded-full transition font-semibold border border-none
              px-4 py-2 text-base
              ${isSelected
                ? "bg-[var(--color-secondary)] text-black"
                : "bg-[var(--color-tab_unselected)] text-white hover:bg-[var(--color-tab_unselected_hover)] hover:text-black"
              }
              max-sm:px-2 max-sm:py-1 max-sm:text-sm
            `}
          >
            <img
              src={modelIcons[m]}
              alt={`${m} icon`}
              className="w-6 h-6 mr-2 max-sm:w-5 max-sm:h-5 max-sm:mr-1"
              draggable="false"
            />
            {m}
          </button>
        );
      })}
    </div>
  );
}