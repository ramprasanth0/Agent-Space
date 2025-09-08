// src/hooks/useStreaming.js
// NOTE: Simplified Gemini branch to rely on API connector accumulation and typed SSE events.
//       Removes local buffering/flush that could double-append when chunks are cumulative.

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
  onStreamComplete
) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState([]);
  const [loadingModels, setLoadingModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([models[0]]);
  const [lastUserQuestion, setLastUserQuestion] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

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
        last = part;
        setResponse(prev => prev.map(r => r.provider === model ? { ...r, response: part } : r));
      };

      const done = () => {
        if (!mountedRef.current) {
          setLoadingModels(prev => prev.filter(m => m !== model));
          return;
        }
        if (onStreamComplete) onStreamComplete(model);
        setLoadingModels(prev => {
          const next = prev.filter(m => m !== model);
          if (next.length === 0) setIsStreaming(false);
          return next;
        });
      };

      const fail = (err) => { replies[model] = { answer: `Error: ${err}` }; };

      try {
        switch (model) {
          case "Sonar":
            await streamChatToPerplexity(
              inputToSend, historyTrim, mode,
              (partial) => update(partial),
              done,
              (err) => fail(err)
            );
            break;

          case "Gemini":
            await streamChatToGemini(
              inputToSend, historyTrim, mode,
              (partial) => update(partial),
              done,
              (err) => fail(err)
            );
            break;

          case "R1":
            await streamChatToDeepSeek(
              inputToSend, historyTrim, mode,
              (partial) => update(partial),
              done,
              (err) => fail(err)
            );
            break;

          case "Qwen":
            await streamChatToQwen(
              inputToSend, historyTrim, mode,
              (partial) => update(partial),
              done,
              (err) => fail(err)
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

    if (mode === "conversation" && selectedModels.length === 1) {
      const m = selectedModels;
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
      if (mountedRef.current) setMessages([]);
    }
  }, [input, selectedModels, setHasStartedChat, sanitizeHistoryForApi, messages, mode, setMessages, onStreamComplete]);

  return {
    input, setInput, handleClick,
    response, loadingModels, isStreaming, lastUserQuestion,
    selectedModels, setSelectedModels
  };
}
