import { useState } from "react"
import { sendChatToPerplexity, sendChatToGemini, sendChatToDeepSeek, sendChatToQwen, sendChatToMultiAgent } from "../api/Agents"
import InputCard from './InputCard'
import ModelSelector from "./ModelSelector";
import ResponseCard from "./ResponseCard";
import ConversationToggle from "./ConversationToggle";

// export default function HeroSection() {
//     const models = ["Sonar", "Gemini", "R1", "Qwen"];

//     const [input, setInput] = useState('');
//     const [loading, setLoading] = useState(false)
//     const [response, setResponse] = useState("");
//     const [loadingModels, setLoadingModels] = useState([]);
//     const [selectedModels, setSelectedModels] = useState([models[0]])

//     const handleClick = async (e) => {
//         e.preventDefault();
//         setLoading(true)
//         setResponse("")
//         console.log(input)
//         try {
//             let data;
//             if (selectedModels.length === 1) {
//                 // Backward compatible, call single-agent function
//                 switch (selectedModels[0]) {
//                     case "Sonar":
//                         data = await sendChatToPerplexity(input); break;
//                     case "Gemini":
//                         data = await sendChatToGemini(input); break;
//                     case "R1":
//                         data = await sendChatToDeepSeek(input); break;
//                     case "Qwen":
//                         data = await sendChatToQwen(input); break;
//                     default:
//                         data = { response: "Model not implemented yet." };
//                 }
//                 setResponse([{ provider: selectedModels[0], response: data.response }]);
//             } else {
//                 // Multi-agent mode
//                 const data = await sendChatToMultiAgent(input, selectedModels);
//                 setResponse(data);
//             }


//         } catch (err) {
//             setResponse("Error: Unable to contact backend.");
//         } finally {
//             setLoading(false);
//         }
//     }


//     return (
//         <div className="bg-oxford_blue-600 rounded-3xl max-w-7xl mx-auto mt-16 shadow-lg flex flex-col items-center z-20"
//         >
//             <ModelSelector
//                 models={models}
//                 selected={selectedModels}
//                 onSelect={setSelectedModels}
//             />
//             <div className="w-full">
//                 <InputCard
//                     input={input}
//                     loading={loading}
//                     setInput={setInput}
//                     handleClick={handleClick}
//                 />
//             </div>
//             {/* {response && (
//                 <div className="bg-english-violet-600 text-night shadow-md rounded-3xl mt-3 m-3 p-6 pt max-w-md w-full">
//                     {response}
//                 </div>
//             )} */}
//             {/* {Array.isArray(response) ? (
//                 <div className="flex flex-wrap gap-4 justify-center">
//                     {response.map((res, idx) => (
//                         <div key={res.provider || idx} className="bg-english-violet-600 text-night shadow-md rounded-3xl mt-3 m-3 p-6 pt max-w-md w-full">
//                             <div className="font-bold mb-2">{res.provider}</div>
//                             {res.response}
//                         </div>
//                     ))}
//                 </div>
//             ) : response && (
//                 <div className="bg-english-violet-600 text-night shadow-md rounded-3xl mt-3 m-3 p-6 pt max-w-md w-full">{response}</div>
//             )} */}
//             {/* <ResponseCard
//                 response={response}
//                 /> */}
//             <div className="w-full" style={{ flex: 1, minHeight: 0 }}>
//                 <div className="max-h-[18rem] overflow-auto w-full no-scrollbar">
//                     <ResponseCard response={response} />
//                 </div>
//             </div>

//         </div>
//     )
// }

export default function HeroSection() {
    const models = ["Sonar", "Gemini", "R1", "Qwen"];

    const [input, setInput] = useState('');
    const [response, setResponse] = useState([]);
    const [loadingModels, setLoadingModels] = useState([]);
    const [selectedModels, setSelectedModels] = useState([models[0]])

    const handleClick = async (e) => {
        e.preventDefault();
        // Start loading all selected models
        setLoadingModels(selectedModels);
        // Show empty skeleton cards immediately
        setResponse(selectedModels.map(m => ({ provider: m, response: null })));

        // "Fan out" async, each updates itself…
        selectedModels.forEach(async (model) => {
            let data;
            try {
                switch (model) {
                    case "Sonar":
                        data = await sendChatToPerplexity(input); break;
                    case "Gemini":
                        data = await sendChatToGemini(input); break;
                    case "R1":
                        data = await sendChatToDeepSeek(input); break;
                    case "Qwen":
                        data = await sendChatToQwen(input); break;
                    default:
                        data = { response: "Model not implemented yet." };
                }
            } catch {
                data = { response: "Error: Unable to contact backend." };
            }
            // Update just this card's response
            setResponse(prev =>
                prev.map(r =>
                    r.provider === model ? { ...r, response: data.response } : r
                )
            );
            // Remove the model from loading
            setLoadingModels(prev => prev.filter(m => m !== model));
        });
    };

    return (
        <div className="bg-oxford_blue-600 rounded-3xl max-w-7xl mx-auto mt-16 shadow-lg flex flex-col items-center z-20">
            <div className="flex items-center  w-full mb-4">
                <ConversationToggle/>
                <ModelSelector
                    models={models}
                    selected={selectedModels}
                    onSelect={setSelectedModels}
                />
            </div>
            <div className="w-full">
                <InputCard
                    input={input}
                    loading={loadingModels.length > 0}
                    setInput={setInput}
                    handleClick={handleClick}
                />
            </div>
            <div className="w-full" style={{ flex: 1, minHeight: 0 }}>
                <div className="max-h-[18rem] overflow-auto w-full no-scrollbar">
                    <ResponseCard response={response} loadingModels={loadingModels} />
                </div>
            </div>
        </div>
    )
}