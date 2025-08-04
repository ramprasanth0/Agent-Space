import { useState } from "react"
import { sendChatToPerplexity, sendChatToGemini, sendChatToDeepSeek, sendChatToQwen, sendChatToMultiAgent } from "../api/Agents"
import InputCard from './InputCard'
import ModelSelector from "./ModelSelector";
import ResponseCard from "./ResponseCard";
import ConversationToggle from "./ConversationToggle";

export default function HeroSection() {
    const models = ["Sonar", "Gemini", "R1", "Qwen"];

    // state var for model data from user
    const [input, setInput] = useState('');
    // state var for response from api
    const [response, setResponse] = useState([]);
    //state var for loading anim (till response from api)
    const [loadingModels, setLoadingModels] = useState([]);
    //state var fro user curr selected model
    const [selectedModels, setSelectedModels] = useState([models[0]])

    //state var for mode (conversation,one-liner)
    const [mode, setMode] = useState("one-liner");
    //state var for history of messages for conversation mode
    const [messages, setMessages] = useState([]); // array of { role, content }

    function handleModeChange(newMode) {
            if (
                newMode === "conversation" && 
                selectedModels.length !== 1
            ) {
                // If switching to conversation with none or more than one model selected → reset to empty
                setSelectedModels([]);
            }
            setMode(newMode);
        }

    const handleClick = async (e) => {
        e.preventDefault();
        // Make a copy of current history plus this turn
        const updatedMessages = [...messages, { role: "user", content: input }];
        setMessages(updatedMessages);

        // Start loading all selected models
        setLoadingModels(selectedModels);
        // Show empty skeleton cards immediately
        setResponse(selectedModels.map(m => ({ provider: m, response: null })));
        setInput(""); // <-- Only clear in conversation mode after send!

        // "Fan out" async, each updates itself…
        selectedModels.forEach(async (model) => {
            let data = null;
            try {
                switch (model) {
                    case "Sonar":
                        data = await sendChatToPerplexity(input, messages, mode); break;
                    case "Gemini":
                        data = await sendChatToGemini(input, messages, mode); break;
                    case "R1":
                        data = await sendChatToDeepSeek(input, messages, mode); break;
                    case "Qwen":
                        data = await sendChatToQwen(input, messages, mode); break;
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
                <ConversationToggle
                    mode={mode}
                    setMode={handleModeChange}
                />
                <ModelSelector
                    models={models}
                    selected={selectedModels}
                    setSelectedModels={setSelectedModels}
                    mode={mode}
                    resetMessages={setMessages}
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