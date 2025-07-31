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

    return (
        <div className="bg-pomp_and_power-300 m-3 rounded-full flex gap-2 p-2 justify-center">
            {models.map((m) => (
                <button
                    key={m}
                    onClick={() => onSelect(m)}
                    className={`flex max-w-xs px-4 py-2 rounded-full transition font-semibold border
                    // ${selected === m ? "active" : ""}
                    ${selected === m
                            ? "bg-english-violet-900 border-none text-night-100"
                            : "bg-pomp_and_power-200 border-none text-white hover:bg-english-violet-800 hover:text-black"}
                    `}
                >
                    {/* Image placed here */}
                    {/* <img src={modelIcons[m]} alt="" className="w-6 h-6 mr-2 inline-block" /> */}
                    <img
                        src={modelIcons[m]}
                        alt={`${m} icon`}
                        className="w-6 h-6 mr-2"
                        draggable="false"
                    />
                    {m}
                </button>
            ))}
        </div>
    );
}