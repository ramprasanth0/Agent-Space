import { use, useState } from "react"
import { sendChatToPerplexity } from "../api/Agents"
import InputBox from './InputBox'
import ModelSelector from "./ModelSelector";

export default function HeroSection() {
    const models = ["Sonar", "Gemini", "R1", "Qwen"];

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState("");
    const [selectedModel, setSelectedModel] =useState(models[0])

    const handleClick = async (e) => {
        e.preventDefault();
        setLoading(true)
        setResponse("")
        console.log(input)
        try {
            const data = await sendChatToPerplexity(input);
            // console.log(data)

            //for testing:
            // const data = { response: "France is located in Western Europe, bordered by Belgium, Luxembourg, Germany, Switzerland, Italy, Monaco, Spain, and Andorra, with coasts on the Mediterranean Sea, Atlantic Ocean, and English Channel[1][2][4]." };


            setResponse(data.response);

        } catch (err) {
            setResponse("Error: Unable to contact backend.");
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="bg-pomp_and_power-300 rounded-3xl flex flex-col justify-center relative z-10">
            <ModelSelector 
                models={models}
                selected={selectedModel} 
                onSelect={setSelectedModel} 
            />
            <InputBox
                input={input}
                loading={loading}
                setInput={setInput}
                handleClick={handleClick}
            />
            {response && (
                <div className="bg-english-violet-700 text-night shadow-md rounded-3xl mt-3 m-3 p-6 pt max-w-md w-full">
                    {response}
                </div>
            )}
        </div>
    )
}
