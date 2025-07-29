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
        <>
            <div>
                <label>
                    Your Unhinged Queries: 
                    <input 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        // disabled={loading}
                        placeholder="Type your message"
                    />
                </label>
                <button onClick={handleClick}>
                    Go!
                </button>
                <p>{response}</p>
            </div>
        </>
    )
}
