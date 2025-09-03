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
            // Buffering approach for Gemini streaming tokens.
            // Many Gemini streams arrive as tiny tokens; we accumulate them
            // and update the UI with a small debounce for stability.
            let lastGeminiResponse = null;
            let accumulated = "";
            let flushTimer = null;
            const FLUSH_MS = 50; // slightly larger debounce for stability

            const scheduleFlush = () => {
              if (flushTimer) return;
              flushTimer = setTimeout(() => {
                // Only update if we still have accumulated tokens
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
                // Remember last structured partial for final replies record
                lastGeminiResponse = partial;

                // Normalize partial shapes:
                // - sometimes the stream sends plain strings (tokens)
                // - sometimes objects like { answer: "...", explanation: ... }
                if (typeof partial === "string") {
                  // accumulate raw string tokens
                  accumulated += partial;
                  scheduleFlush();
                } else if (partial && typeof partial === "object") {
                  // If it's a streaming token object (small piece) with answer and no explanation
                  if (partial.answer && !partial.explanation) {
                    accumulated += partial.answer;
                    scheduleFlush();
                  } else {
                    // This is likely a final structured object (explanation/sources/etc.)
                    // first flush any buffered tokens
                    if (accumulated) {
                      clearFlushTimer();
                      update({ answer: accumulated });
                      accumulated = "";
                    }
                    // then show the structured partial
                    update(partial);
                  }
                } else {
                  // Unknown shape: append safely
                  accumulated += String(partial ?? "");
                  scheduleFlush();
                }
              },
              () => {
                // On done: flush any remaining accumulated tokens, clear timers, then mark done
                if (flushTimer) {
                  clearTimeout(flushTimer);
                  flushTimer = null;
                }
                if (accumulated && mountedRef.current) {
                  // Final flush
                  update({ answer: accumulated });
                  // reflect that in lastGeminiResponse if nothing else was final
                  lastGeminiResponse = lastGeminiResponse || { answer: accumulated };
                  accumulated = "";
                }
                done();
                replies[model] = lastGeminiResponse || { answer: "No response received" };
              },
              (err) => {
                // On error: clear timer and record failure
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
