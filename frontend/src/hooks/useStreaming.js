import { useState, useCallback } from "react";
import {
    streamChatToPerplexity,
    streamChatToGemini,
    streamChatToDeepSeek,
    streamChatToQwen
} from "../api/Agents";

/**
 * useStreaming(...)
 *
 * Signature unchanged:
 *   useStreaming(models, sanitizeHistory, messages, setMessages, mode, setHasStartedChat)
 *
 * Returns the same shape as before.
 */
export function useStreaming(
    models,               // ["Sonar","Gemini","R1","Qwen"]
    sanitizeHistory,
    messages, setMessages,
    mode, setHasStartedChat
) {
    /* state */
    const [input, setInput] = useState("");
    const [response, setResponse] = useState([]);
    const [loadingModels, setLoadingModels] = useState([]);
    const [selectedModels, setSelectedModels] = useState([models[0]]);
    const [lastUserQuestion, setLastUserQuestion] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);

    /**
     * handleClick - flexible handler
     * - Accepts (event) -> uses current `input` state (and calls e.preventDefault())
     * - Accepts (string) -> uses provided string as the input to send
     * - Accepts () -> uses current `input` state
     */
    const handleClick = useCallback(async (maybeEventOrInput) => {
        // determine call shape
        const isEventLike = maybeEventOrInput && typeof maybeEventOrInput.preventDefault === "function";
        const isString = typeof maybeEventOrInput === "string";

        // prevent default if it's an event
        if (isEventLike) {
            try { maybeEventOrInput.preventDefault(); } catch (_) { }
        }

        // resolve the text to send
        const inputToSend = isString ? maybeEventOrInput : input;

        if (!inputToSend || !inputToSend.trim()) return;

        // prepare UI
        setResponse([]);
        setLoadingModels(() => [...selectedModels]);
        setResponse(selectedModels.map(m => ({ provider: m, response: null })));
        setLastUserQuestion(inputToSend);
        setInput(""); // clear the input in the UI
        setIsStreaming(true);
        setHasStartedChat(true);

        const historyTrim = sanitizeHistory([
            ...messages,
            { role: "user", content: inputToSend }
        ]);

        const replies = {};

        await Promise.all(selectedModels.map(async model => {
            let last = null;
            const update = part =>
                setResponse(prev => prev.map(r => r.provider === model ? { ...r, response: part } : r));

            const done = () =>
                setLoadingModels(q => {
                    const next = q.filter(m => m !== model);
                    if (next.length === 0) setIsStreaming(false);
                    return next;
                });

            const fail = err => (replies[model] = { answer: `Error: ${err}` });

            try {
                switch (model) {
                    case "Sonar":
                        await streamChatToPerplexity(inputToSend, historyTrim, mode, p => (last = p, update(p)), done, fail);
                        break;
                    case "Gemini":
                        await streamChatToGemini(inputToSend, historyTrim, mode, p => (last = p, update(p)), done, fail);
                        break;
                    case "R1":
                        await streamChatToDeepSeek(inputToSend, historyTrim, mode, p => (last = p, update(p)), done, fail);
                        break;
                    case "Qwen":
                        await streamChatToQwen(inputToSend, historyTrim, mode, p => (last = p, update(p)), done, fail);
                        break;
                    default:
                        replies[model] = { answer: "Model not implemented" };
                }
            } catch (err) {
                replies[model] = { answer: `Error: ${err}` };
            }

            replies[model] ||= last || { answer: "No response" };
        }));

        /* push to chat history (conversation mode) */
        if (mode === "conversation" && selectedModels.length === 1) {
            const m = selectedModels[0];
            setMessages(old => [
                ...old,
                { role: "user", content: inputToSend },
                { role: "assistant", content: replies[m], provider: m }
            ]);
        } else {
            setMessages([]); // keep one-liner history empty
        }
    }, [
        input, selectedModels, setHasStartedChat,
        sanitizeHistory, messages, mode, setMessages
    ]);

    return {
        input, setInput, handleClick,
        response, loadingModels, isStreaming, lastUserQuestion,
        selectedModels, setSelectedModels
    };
}
