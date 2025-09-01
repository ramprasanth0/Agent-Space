// src/hooks/useStreaming.js
import { useState, useCallback, useRef, useEffect } from "react";
import {
  streamChatToPerplexity,
  streamChatToGemini,
  streamChatToDeepSeek,
  streamChatToQwen
} from "../api/Agents";

/**
 * useStreaming(...):
 * Signature preserved:
 *   useStreaming(models, sanitizeHistoryForApi, messages, setMessages, mode, setHasStartedChat)
 */
export function useStreaming(
  models,
  sanitizeHistoryForApi,
  messages, setMessages,
  mode, setHasStartedChat
) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState([]);
  const [loadingModels, setLoadingModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([models[0]]);
  const [lastUserQuestion, setLastUserQuestion] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  // mountedRef prevents setState after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const handleClick = useCallback(async (maybeEventOrInput) => {
    const isEventLike = maybeEventOrInput && typeof maybeEventOrInput.preventDefault === "function";
    const isString = typeof maybeEventOrInput === "string";
    if (isEventLike) {
      try { maybeEventOrInput.preventDefault(); } catch (_) {}
    }

    const inputToSend = isString ? maybeEventOrInput : input;
    if (!inputToSend || !inputToSend.trim()) return;

    // prepare UI - single updates where possible
    const providers = [...selectedModels];
    if (mountedRef.current) {
      setResponse(providers.map(m => ({ provider: m, response: null })));
      setLoadingModels(providers);
      setLastUserQuestion(inputToSend);
      setInput("");
      setIsStreaming(true);
      setHasStartedChat(true);
    }

    const historyTrim = sanitizeHistoryForApi([
      ...messages,
      { role: "user", content: inputToSend }
    ]);

    const replies = {};

    await Promise.all(providers.map(async (model) => {
      let last = null;

      const update = (part) => {
        if (!mountedRef.current) return;
        setResponse(prev => prev.map(r => r.provider === model ? { ...r, response: part } : r));
      };

      const done = () => {
        if (!mountedRef.current) {
          // still update loadingModels to keep internal counters consistent
          setLoadingModels(prev => prev.filter(m => m !== model));
          return;
        }
        setLoadingModels(prev => {
          const next = prev.filter(m => m !== model);
          if (next.length === 0) {
            setIsStreaming(false);
          }
          return next;
        });
      };

      const fail = (err) => { replies[model] = { answer: `Error: ${err}` }; };

      try {
        switch (model) {
          case "Sonar":
            await streamChatToPerplexity(
              inputToSend, historyTrim, mode,
              (partial) => { last = partial; update(partial); },
              done,
              (err) => { fail(err); }
            );
            break;

          case "Gemini": {
            let lastGeminiResponse = null;
            let accumulatedTokens = '';
            let updateTimer = null;

            await streamChatToGemini(
              inputToSend, historyTrim, mode,
              (partial) => {
                lastGeminiResponse = partial;
                if (partial && partial.answer && !partial.explanation) {
                  accumulatedTokens += partial.answer;
                  if (!updateTimer) {
                    updateTimer = setTimeout(() => {
                      update({ answer: accumulatedTokens });
                      updateTimer = null;
                    }, 50); // small debounce for UI stability (50ms)
                  }
                } else {
                  if (updateTimer) { clearTimeout(updateTimer); updateTimer = null; }
                  update(partial);
                }
              },
              () => {
                if (updateTimer) clearTimeout(updateTimer);
                done();
                replies[model] = lastGeminiResponse || { answer: "No response received" };
              },
              (err) => { fail(err); }
            );
            break;
          }

          case "R1":
            await streamChatToDeepSeek(
              inputToSend, historyTrim, mode,
              (partial) => { last = partial; update(partial); },
              done,
              (err) => { fail(err); }
            );
            break;

          case "Qwen":
            await streamChatToQwen(
              inputToSend, historyTrim, mode,
              (partial) => { last = partial; update(partial); },
              done,
              (err) => { fail(err); }
            );
            break;

          default:
            replies[model] = { answer: "Model not implemented" };
        }
      } catch (err) {
        replies[model] = { answer: `Error: ${err}` };
      }

      replies[model] ||= last || { answer: "No response" };
    }));

    // push to chat history (conversation mode)
    if (mode === "conversation" && selectedModels.length === 1) {
      const m = selectedModels[0];
      const assistant = replies[m];
      if (assistant && (assistant.answer || assistant.sources || assistant.facts)) {
        if (mountedRef.current) {
          setMessages(old => [
            ...old,
            { role: "user", content: inputToSend },
            { role: "assistant", content: assistant, provider: m }
          ]);
        }
      } else {
        if (mountedRef.current) {
          setMessages(old => [...old, { role: "user", content: inputToSend }]);
        }
      }
    } else {
      if (mountedRef.current) {
        setMessages([]);
      }
    }
  }, [input, selectedModels, setHasStartedChat, sanitizeHistoryForApi, messages, mode, setMessages]);

  return {
    input, setInput, handleClick,
    response, loadingModels, isStreaming, lastUserQuestion,
    selectedModels, setSelectedModels
  };
}
