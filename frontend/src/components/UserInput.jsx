import { use, useState } from "react"
import { sendChatToPerplexity } from "../api/Agents"


export default function UserInput(){
    const [loading, setLoading] = useState(false)
    const [input, setInput] = useState('');
    const [response,setResponse] = useState("");

    const handleClick = async(e) =>{
        setLoading(true)
        e.preventDefault();
        setResponse("")
        console.log(input)
        try{
            const data = await sendChatToPerplexity(input);
            // console.log(data)
            setResponse(data.response);

        }catch(err){
            setResponse("Error: Unable to contact backend.");
        }finally {
            setLoading(false);
        }
    }


    return(
        <div className="flex flex-col rounded-xl items-center justify-center relative z-10">
            <div className="bg-violet-900 shadow-md rounded-3xl p-6 max-w-md w-full">
                <label className="flex items-center gap-2 mb-4">
                    Your Unhinged Queries: 
                    <input className="px-3 block py-2 border border-gray-300 rounded-md bg-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={loading}
                        placeholder="Type your message"
                    />
                </label>
                <button 
                    className="mt-4 w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition"
                    onClick={handleClick}
                    disabled={loading || !input.trim()}
                    >
                        {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                            </svg>
                            Loading...
                        </span>
                    ) : "Go!"}
                </button>
                <div>
                    {response}
                </div>
            </div>
        </div>
    )
}
