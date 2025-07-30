// A reusable toggle selector for LLM/model choice
export default function ModelSelector({ models, selected, onSelect }) {
    return (
        <div className="flex gap-2 p-4 justify-center">
        {models.map((m) => (
            <button
          key={m}
          onClick={() => onSelect(m)}
          className={`px-4 py-2 rounded-xl transition font-semibold border
            // ${selected === m ? "active" : ""}
            ${selected === m
              ? "bg-violet-600 text-white border-violet-800 shadow"
              : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-violet-700"}
            `}
        >
          {m}
        </button>
        ))}
        </div>
  );
}