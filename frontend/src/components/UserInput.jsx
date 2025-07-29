import { use, useState } from "react"
import { sendChatToPerplexity } from "../api/Agents"


export default function UserInput(){
    const [input, setInput] = useState('');
    const [response,setResponse] = useState("");

    const handleClick = async(e) =>{
        e.preventDefault();
        setResponse("")
        console.log(input)
        try{
            const data = await sendChatToPerplexity(input);
            // console.log(data)
            setResponse(data.response);

        }catch(err){
            setResponse("Error: Unable to contact backend.");
        }
    }


    return(
        <div className="flex flex-col rounded-xl items-center justify-center">
            <div className="bg-violet-900 shadow-md rounded-3xl p-6 max-w-md w-full">
                <label className="flex items-center gap-2 mb-4">
                    Your Unhinged Queries: 
                    <input className="px-3 block py-2 border border-gray-300 rounded-md bg-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        // disabled={loading}
                        placeholder="Type your message"
                    />
                </label>
                <button className="mt-4 w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition"
                onClick={handleClick}>
                    Go!
                </button>
                <p>{response}</p>
            </div>
        </div>
    )
}
