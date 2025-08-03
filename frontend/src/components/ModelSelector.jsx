// A reusable toggle selector for LLM/model choice
import deepSeek from '../assets/deepSeek.svg'
import gemini from '../assets/gemini.svg'
import perplexity from '../assets/perplexity.svg'
import qwen from '../assets/qwen.svg'


export default function ModelSelector({ models, selected, onSelect }) {
    // const modelIcons = {Sonar:perplexity, Gemini:gemini, R1:deepSeek, Qwen:qwen}
    const modelIcons = {
        Sonar: perplexity,
        R1: deepSeek,
        Gemini: gemini,
        Qwen: qwen,
    };

    // const toggleModel = (m) => {
    //     if (selected.includes(m)) {
    //         onSelect(selected.filter(x => x !== m));
    //     } else {
    //         onSelect([...selected, m]);
    //     }
    // };
    function toggleModel(model) {
    if (selected.includes(model)) {
      onSelect(selected.filter(m => m !== model));
    } else {
      onSelect([...selected, model]);
    }
    }

    return (
        <div className="bg-oxford_blue-700 my-3 mr-3 ml-2 rounded-full flex gap-2 p-2 justify-center">
            {models.map((m) => (
                <button
                    type="button"
                    key={m}
                    onClick={() => toggleModel(m)}
                    className={`flex max-w-xs px-4 py-2 rounded-full transition font-semibold border
                        ${selected.includes(m)
                            ? "bg-tekhelet-900 border-none text-black"
                            : "bg-oxford_blue-500 border-none text-white hover:bg-tekhelet-800 hover:text-black"}
                    `}
                >
                    <img src={modelIcons[m]} alt={`${m} icon`} className="w-6 h-6 mr-2" draggable="false" />
                    {m}
                </button>
            ))}
        </div>
    );
}
