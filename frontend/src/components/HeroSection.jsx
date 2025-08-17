import React from "react";
import { useState, useMemo, useRef, useEffect } from "react"
import { sendChatToPerplexity, sendChatToGemini, sendChatToDeepSeek, sendChatToQwen, streamChatToPerplexity, streamChatToGemini, streamChatToDeepSeek, streamChatToQwen } from "../api/Agents"
import InputCard from './InputCard'
import SubmitButton from "./SubmitButton";
import ModelSelector from "./ModelSelector";
import ResponseCard from "./ResponseCard";
import ConversationToggle from "./ConversationToggle";
import Alert from "../components/Alert"
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

export default function HeroSection({ setHasStartedChat }) {
    const models = ["Sonar", "Gemini", "R1", "Qwen"];

    const alertRef = useRef();
    useEffect(() => {
        if (alertRef.current) {
            alertRef.current.show("Welcome! One-liner mode enabled");
        }
    }, []);

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

    const [uiMode, setUIMode] = useState('center'); // "center" | "chat"

    const chatContainerRef = useRef(null);
    // Scroll to bottom when messages or response change (for streaming)
    useEffect(() => {
        if (
            response.some(r => r.response) ||        // Any non-empty response
            messages.length > 0 ||                   // For conversation mode
            loadingModels.length > 0
        ) {
            setUIMode('chat');
        } else {
            setUIMode('center');
        }
    }, [response, messages, loadingModels]);

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
        setHasStartedChat(true);
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
                        {
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
                        }


                    case "R1":
                        {
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
                        }

                    case "Qwen":
                        {
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
                        }

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
        } else if (mode === "one-liner") {
            setMessages([]); // Or keep last turn if desired for one-liner display
        }
    }

    return (
        <>
            {uiMode === 'center' ? (
                // Before chat starts: only show input & controls, centered vertically
                <div className="flex flex-col w-2xl mx-auto justify-center">
                    <div className="bg-primary rounded-3xl shadow-lg w-full">
                        <div className="flex items-center w-full">
                            <ConversationToggle mode={mode} setMode={handleModeChange} />
                            <ModelSelector
                                models={models}
                                selected={selectedModels}
                                setSelectedModels={setSelectedModels}
                                mode={mode}
                                resetMessages={setMessages}
                            />
                            <div className="flex-grow">
                                <SubmitButton
                                    loading={loadingModels.length > 0}
                                    disabled={!input.trim()}
                                    onClick={handleClick}
                                />
                            </div>
                        </div>
                        <InputCard input={input} setInput={setInput} handleClick={handleClick} />
                    </div>
                </div>
            ) : (
                // After chat starts: full container with response and controls
                <div
                    className={`
          flex flex-col mx-auto rounded-3xl shadow-lg relative bg-primary/50 transition-all
          h-[calc(100vh-1rem)] w-full
          ${mode === 'one-liner' && selectedModels.length > 1 ? 'max-w-7xl' : 'max-w-2xl'}
        `}
                >
                    <div
                        ref={chatContainerRef}
                        className={`
            flex-grow overflow-y-auto min-h-0 w-full mx-auto
            ${mode === 'one-liner' && selectedModels.length > 1 ? 'max-w-7xl' : 'max-w-2xl'}
          `}
                    >
                        <ResponseCard
                            userQuestion={lastUserQuestion}
                            response={toShow || response}
                            loadingModels={loadingModels}
                        />
                    </div>

                    <Alert ref={alertRef} />

                    <div className="flex flex-col flex-none w-full max-w-2xl mx-auto items-center bg-primary rounded-3xl shadow-lg">
                        <div className="flex items-center w-full">
                            <ConversationToggle mode={mode} setMode={handleModeChange} />
                            <ModelSelector
                                models={models}
                                selected={selectedModels}
                                setSelectedModels={setSelectedModels}
                                mode={mode}
                                resetMessages={setMessages}
                            />
                            <div className="flex-grow">
                                <SubmitButton
                                    loading={loadingModels.length > 0}
                                    disabled={!input.trim()}
                                    onClick={handleClick}
                                />
                            </div>
                        </div>
                        <InputCard input={input} setInput={setInput} handleClick={handleClick} />
                    </div>
                </div>
            )}
        </>
    );



}
