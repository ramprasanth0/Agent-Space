// src/hooks/useStreaming.js
// NOTE: This is the full, updated code for the file.
// It now accepts an `onStreamComplete` callback to notify the parent
// component when each individual model's stream has finished. (NEW)

import { useState, useCallback, useRef, useEffect } from "react";
import {
  streamChatToPerplexity,
  streamChatToGemini,
  streamChatToDeepSeek,
  streamChatToQwen
} from "../api/Agents";

export function useStreaming(
  models,
  sanitizeHistoryForApi,
  messages, setMessages,
  mode, setHasStartedChat,
  onStreamComplete // (NEW) Callback to signal completion for a specific model.
) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState([]);
  const [loadingModels, setLoadingModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([models[0]]);
  const [lastUserQuestion, setLastUserQuestion] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  // mountedRef prevents setState on unmounted components.
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

    // Prepare UI for a new request.
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

      // (NEW) This function now calls the onStreamComplete callback with the model name.
      const done = () => {
        if (!mountedRef.current) {
          setLoadingModels(prev => prev.filter(m => m !== model));
          return;
        }

        // Signal to the parent component that this specific model's stream is complete.
        if (onStreamComplete) {
          onStreamComplete(model);
        }

        setLoadingModels(prev => {
          const next = prev.filter(m => m !== model);
          if (next.length === 0) {
            setIsStreaming(false); // Set global streaming to false only when all are done.
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
            // ... (The Gemini-specific logic remains unchanged) ...
            let lastGeminiResponse = null;
            let accumulated = "";
            let flushTimer = null;
            const FLUSH_MS = 50;

            const scheduleFlush = () => {
              if (flushTimer) return;
              flushTimer = setTimeout(() => {
                if (accumulated && mountedRef.current) {
                  update({ answer: accumulated });
                }
                flushTimer = null;
              }, FLUSH_MS);
            };

            const clearFlushTimer = () => {
              if (flushTimer) {
                clearTimeout(flushTimer);
                flushTimer = null;
              }
            };

            await streamChatToGemini(
              inputToSend, historyTrim, mode,
              (partial) => {
                lastGeminiResponse = partial;
                if (typeof partial === "string") {
                  accumulated += partial;
                  scheduleFlush();
                } else if (partial && typeof partial === "object") {
                  if (partial.answer && !partial.explanation) {
                    accumulated += partial.answer;
                    scheduleFlush();
                  } else {
                    if (accumulated) {
                      clearFlushTimer();
                      update({ answer: accumulated });
                      accumulated = "";
                    }
                    update(partial);
                  }
                } else {
                  accumulated += String(partial ?? "");
                  scheduleFlush();
                }
              },
              () => {
                if (flushTimer) {
                  clearTimeout(flushTimer);
                  flushTimer = null;
                }
                if (accumulated && mountedRef.current) {
                  update({ answer: accumulated });
                  lastGeminiResponse = lastGeminiResponse || { answer: accumulated };
                  accumulated = "";
                }
                done(); // Call the main done function.
                replies[model] = lastGeminiResponse || { answer: "No response received" };
              },
              (err) => {
                if (flushTimer) {
                  clearTimeout(flushTimer);
                  flushTimer = null;
                }
                fail(err);
              }
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

    // Update message history for conversation mode.
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
  }, [input, selectedModels, setHasStartedChat, sanitizeHistoryForApi, messages, mode, setMessages, onStreamComplete]); // (NEW) Add onStreamComplete to dependencies.

  return {
    input, setInput, handleClick,
    response, loadingModels, isStreaming, lastUserQuestion,
    selectedModels, setSelectedModels
  };
}
