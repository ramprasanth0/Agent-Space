import React from "react";
import { useState, useMemo, useRef } from "react"
import { sendChatToPerplexity, sendChatToGemini, sendChatToDeepSeek, sendChatToQwen, streamChatToPerplexity, streamChatToGemini, streamChatToDeepSeek, streamChatToQwen } from "../api/Agents"
import InputCard from './InputCard'
import ModelSelector from "./ModelSelector";
import ResponseCard from "./ResponseCard";
import ConversationToggle from "./ConversationToggle";
// import Alert from "./Alert";

/**
 * Sanitizes the chat history to ensure it's in a simple, API-friendly format.
 * The backend expects the 'content' of every message to be a string.
 */

const useDebounced = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

const sanitizeHistoryForApi = (messages) => {
    return messages.map(msg => {
        let content = '';
        
        // Handle undefined/null content properly
        if (msg.content === undefined || msg.content === null) {
            console.warn('sanitizeHistoryForApi: message content is undefined/null:', msg);
            content = '';
        } else if (typeof msg.content === 'object' && msg.content !== null) {
            content = msg.content.answer || '';
        } else if (typeof msg.content === 'string') {
            content = msg.content;
        } else {
            console.warn('sanitizeHistoryForApi: unexpected content type:', typeof msg.content, msg.content);
            content = String(msg.content);
        }
        
        return { 
            role: msg.role, 
            content: content.trim() 
        };
    }).filter(msg => {
        // Filter out messages with empty content
        const isValid = msg.content && msg.content.trim() !== '' && msg.role;
        if (!isValid) {
            console.warn('Filtering out invalid message:', msg);
        }
        return isValid;
    });
};



export default function HeroSection({ alertRef }) {
    const models = ["Sonar", "Gemini", "R1", "Qwen"];

    // state var for model data from user
    const [input, setInput] = useState('');
    // state var to remember user last question
    const [lastUserQuestion, setLastUserQuestion] = useState("");
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
    //state var for streaming process
    const [isStreaming, setIsStreaming] = useState(false);

    //state var for alert message
    // const [alertMsg, setAlertMsg] = useState("");
    //
    // const alertRef = useRef();

    function handleModeChange(newMode) {
        if (newMode === "conversation" && selectedModels.length !== 1) {
            // If switching to conversation with none or more than one model selected → reset to empty
            setSelectedModels([]);
        }
        setMode(newMode);
        //Show alert on toggle
        alertRef.current.show(
            mode === "conversation"
                ? "One-liner mode enabled"
                : "Conversation mode enabled (switching model will reset history)"
        );
    }
    let toShow = null;
    if (mode === "conversation" && selectedModels.length === 1 && messages.length > 0 && !isStreaming) {
        const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
        if (lastAssistant) {
            toShow = [{ provider: selectedModels[0], response: lastAssistant.content }];
        }
    }
    // console.log("toShow",toShow)

    // function sanitizeHistory(historyArr) {
    //     return historyArr.map(msg => ({
    //         role: typeof msg.role === "string" ? msg.role : String(msg.role),
    //         content: typeof msg.content === "string" ? msg.content : String(msg.content ?? "")
    //     }));
    // }

    const handleClick = async (e) => {
        e.preventDefault();
        if (!input.trim()) return; // Prevent empty sends

        // Make a copy of current history plus this turn
        // const updatedMessages = [...messages, { role: "user", content: input }];
        // setMessages(updatedMessages);

        // Add the current input as a user message:
        const userMessageObj = { role: "user", content: input };
        // This is the TRUE chat history to send for this turn:
        const currentHistory = [...messages, userMessageObj];

        // Creating a sanitized version of the history specifically for the API call.
        const historyToSend = sanitizeHistoryForApi(currentHistory);

        // Clear previous responses completely
        setResponse([]);  // Clear first
    
        // Start loading all selected models  
        setLoadingModels(selectedModels);
    
        // Show empty skeleton cards immediately
        setResponse(selectedModels.map(m => ({ provider: m, response: null })));
        setLastUserQuestion(input); // <--remembering last question
        setInput(""); // <-- Only clear in conversation mode after send!

        // We'll keep all LLM replies here by provider name (for multi llm replies)
        const replies = {};

        setIsStreaming(true);

        // "Fan out" async, each updates itself…
        await Promise.all(selectedModels.map(async (model) => {
            let data = null;
            try {
                switch (model) {
                    case "Sonar":
                        console.log('Streaming from backend:', historyToSend);

                        // Track the final structured response for conversation history
                        let lastSonarResponse = null;
                        
                        await streamChatToPerplexity(
                            input, historyToSend, mode,
                            (partial) => {
                                lastSonarResponse = partial;
                                
                                setResponse(prev =>
                                    prev.map(r =>
                                        r.provider === model 
                                            ? { ...r, response: partial }
                                            : r
                                    )
                                );
                            },
                            () => {
                                setLoadingModels(prev => prev.filter(m => m !== model));
                                replies[model] = lastSonarResponse || { answer: "No response" };

                                // Check if all models done streaming
                                if (loadingModels.length === 1) { // This model is the last one
                                    setIsStreaming(false);
                                }
                            },
                            (error) => {
                                // ... error handling
                                replies[model] = { answer: `Error: ${error}` };
                            }
                        );
                        break;

                    case "Gemini":
                        console.log('Streaming from backend:', historyToSend);
                        
                        // Track the final structured response for conversation history
                        let lastGeminiResponse = null;
                        let accumulatedTokens = ''; // ✅ Accumulate tokens locally
                        let updateTimer = null;
                        
                        await streamChatToGemini(
                            input, historyToSend, mode,
                            (partial) => {
                                lastGeminiResponse = partial;
                                
                                // For streaming tokens, accumulate locally and update less frequently
                                if (partial.answer && !partial.explanation) {
                                    accumulatedTokens += partial.answer;
                                    
                                    // Update UI after every syncronous phase instead of every token
                                    if (!updateTimer) {
                                        updateTimer = setTimeout(() => {
                                            setResponse(prev =>
                                                prev.map(r =>
                                                    r.provider === model 
                                                        ? { ...r, response: { answer: accumulatedTokens } }
                                                        : r
                                                )
                                            );
                                            updateTimer = null;
                                        }, 0);
                                    }
                                } else {
                                    // ✅ Immediate update for final structured response
                                    setResponse(prev =>
                                        prev.map(r =>
                                            r.provider === model 
                                                ? { ...r, response: partial }
                                                : r
                                        )
                                    );
                                }
                            },
                            () => {
                                    if (updateTimer) clearTimeout(updateTimer);
                                    setLoadingModels(prev => prev.filter(m => m !== model));
                                    replies[model] = lastGeminiResponse || { answer: "No response received" };
                                },
                            (error) => {
                                // ... error handling
                                replies[model] = { answer: `Error: ${error}` };
                            }
                        );
                        break;


                    case "R1":
                        console.log('Streaming from backend:', historyToSend);

                        // Track the final structured response for conversation history
                        let lastDeepseekResponse = null;
                        
                        await streamChatToDeepSeek(
                            input, historyToSend, mode,
                            (partial) => {
                                lastDeepseekResponse = partial;
                                
                                setResponse(prev =>
                                    prev.map(r =>
                                        r.provider === model 
                                            ? { ...r, response: partial }
                                            : r
                                    )
                                );
                            },
                            () => {
                                setLoadingModels(prev => prev.filter(m => m !== model));
                                replies[model] = lastDeepseekResponse || { answer: "No response" };

                                // Check if all models done streaming
                                if (loadingModels.length === 1) { // This model is the last one
                                    setIsStreaming(false);
                                }
                            },
                            (error) => {
                                // ... error handling
                                replies[model] = { answer: `Error: ${error}` };
                            }
                        );
                        break;

                    case "Qwen":
                        console.log('Streaming from backend:', historyToSend);

                        // Track the final structured response for conversation history
                        let lastQwenResponse = null;
                        
                        await streamChatToQwen(
                            input, historyToSend, mode,
                            (partial) => {
                                lastQwenResponse = partial;
                                
                                setResponse(prev =>
                                    prev.map(r =>
                                        r.provider === model 
                                            ? { ...r, response: partial }
                                            : r
                                    )
                                );
                            },
                            () => {
                                setLoadingModels(prev => prev.filter(m => m !== model));
                                replies[model] = lastQwenResponse || { answer: "No response" };

                                // Check if all models done streaming
                                if (loadingModels.length === 1) { // This model is the last one
                                    setIsStreaming(false);
                                }
                            },
                            (error) => {
                                // ... error handling
                                replies[model] = { answer: `Error: ${error}` };
                            }
                        );
                        break;

                    default:
                        data = { response: "Model not implemented yet." };
                }
            } catch {
                data = { response: { answer: "Error: Unable to contact backend." } };
            }
        }));

        // Store user + assistant messages in state (for full chat context)
        // Only in conversation mode—with one model

        if (mode === "conversation" && selectedModels.length === 1) {
            const model = selectedModels[0];
            
            // Ensure we have a valid response before storing
            const assistantResponse = replies[model];
            
            if (assistantResponse && (assistantResponse.answer || assistantResponse.sources || assistantResponse.facts)) {
                setMessages([
                    ...messages,
                    { role: "user", content: input },
                    { role: "assistant", content: assistantResponse }
                ]);
            } else {
                console.error(`No valid response from ${model}:`, assistantResponse);
                // Store user message only, skip assistant response
                setMessages([
                    ...messages,
                    { role: "user", content: input }
                ]);
            }
        }else if (mode === "one-liner") {
                    setMessages([]); // Or keep last turn if desired for one-liner display
                }
    }


    return (
        <div className="bg-primary rounded-3xl max-w-7xl mx-auto shadow-lg flex flex-col items-center z-20 relative">
            <div className="flex items-center w-full">
                <ConversationToggle
                    mode={mode}
                    setMode={handleModeChange}
                // setAlertMsg={setAlertMsg}
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
                <div className="max-h-[18rem] overflow-auto w-full">
                    <ResponseCard
                        userQuestion={lastUserQuestion}
                        response={toShow || response}
                        loadingModels={loadingModels}
                    />
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