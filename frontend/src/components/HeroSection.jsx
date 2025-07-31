import { use, useState } from "react"
import { sendChatToPerplexity, sendChatToGemini, sendChatToDeepSeek, sendChatToQwen, sendChatToMultiAgent} from "../api/Agents"
import InputBox from './InputBox'
import ModelSelector from "./ModelSelector";

export default function HeroSection() {
    const models = ["Sonar", "Gemini", "R1", "Qwen"];

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState("");
    const [selectedModels, setSelectedModels] = useState([models[0]])

    const handleClick = async (e) => {
        e.preventDefault();
        setLoading(true)
        setResponse("")
        console.log(input)
        try {
            let data;
            if (selectedModels.length === 1) {
                // Backward compatible, call single-agent function
                switch (selectedModels[0]) {
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
                setResponse(data.response); // maintain as before
            } else {
                // Multi-agent case
                data = await sendChatToMultiAgent(input, selectedModels);
                setResponse(data); // this should be an array of { provider, response }
            }

        } catch (err) {
            setResponse("Error: Unable to contact backend.");
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="bg-pomp_and_power-200 rounded-3xl flex flex-col justify-center relative z-10">
            <ModelSelector
                models={models}
                selected={selectedModels}
                onSelect={setSelectedModels}
            />
            <InputBox
                input={input}
                loading={loading}
                setInput={setInput}
                handleClick={handleClick}
            />
            {/* {response && (
                <div className="bg-english-violet-600 text-night shadow-md rounded-3xl mt-3 m-3 p-6 pt max-w-md w-full">
                    {response}
                </div>
            )} */}
            {Array.isArray(response) ? (
                <div className="flex flex-wrap gap-4 justify-center">
                    {response.map((res, idx) => (
                        <div key={res.provider || idx} className="bg-english-violet-600 text-night shadow-md rounded-3xl mt-3 m-3 p-6 pt max-w-md w-full">
                            <div className="font-bold mb-2">{res.provider}</div>
                            {res.response}
                        </div>
                    ))}
                </div>
            ) : response && (
                <div className="bg-english-violet-600 text-night shadow-md rounded-3xl mt-3 m-3 p-6 pt max-w-md w-full">{response}</div>
            )}
        </div>
    )
}
