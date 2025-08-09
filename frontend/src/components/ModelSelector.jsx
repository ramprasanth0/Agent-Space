// ModelSelector.jsx
import React from "react";

import deepSeek from '../assets/deepSeek.svg';
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
        <div className="bg-[var(--color-neutral)] my-3 mr-3 ml-2 rounded-full flex gap-2 p-2 justify-center">
            {models.map((m) => {
                const isSelected = selected.includes(m);
                return (
                    <button
                        type="button"
                        key={m}
                        onClick={() => toggleModel(m)}
                        className={`flex max-w-xs px-4 py-2 rounded-full transition font-semibold border border-none
              ${isSelected
                                ? "bg-[var(--color-secondary)] text-black"
                                : "bg-[var(--color-tab_unselected)] text-white hover:bg-[var(--color-tab_unselected_hover)] hover:text-black"
                            }`}
                    >
                        <img
                            src={modelIcons[m]}
                            alt={`${m} icon`}
                            className="w-6 h-6 mr-2"
                            draggable="false"
                        />
                        {m}
                    </button>
                );
            })}
        </div>
    );
}
