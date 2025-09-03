// HeroSection.js
// NOTE: This is the full, updated code for the file.
// It now tracks stream completion on a per-model basis to ensure
// each response card finalizes independently. (NEW)

import React, { useState, useRef, useEffect } from "react";
import { useStreaming } from "../hooks/useStreaming";
import { sanitizeHistoryForApi, models as modelsConst } from "../utils/chat";
import InputCard from './InputCard';
import ToolBar from "./ToolBar";
import ResponseCard from "./ResponseCard";
import Alert from "../components/Alert";

export default function HeroSection({ hasStartedChat, setHasStartedChat }) {
  // models
  const models = modelsConst || ["Sonar", "Gemini", "R1", "Qwen"];

  // refs
  const alertRef = useRef();
  const toolbarRef = useRef(null);

  useEffect(() => {
    alertRef.current?.show("Welcome! One-liner mode enabled", toolbarRef.current);
  }, []);

  // message history
  const [messages, setMessages] = useState([]);

  // mode
  const [mode, setMode] = useState("one-liner");

  // UI mode
  const [uiMode, setUIMode] = useState('center');

  const chatContainerRef = useRef(null);

  // --- (NEW) Per-model stream completion state ---
  // We now use an object to track the completion status for each model's stream.
  // The key is the model name (e.g., "Sonar"), and the value is a boolean.
  const [streamCompletion, setStreamCompletion] = useState({});

  // useStreaming hook - it will now call our new onComplete handler
  const {
    input, setInput, handleClick,
    response, loadingModels,
    lastUserQuestion, selectedModels, setSelectedModels,
    isStreaming
  } = useStreaming(
    models,
    sanitizeHistoryForApi,
    messages, setMessages,
    mode, setHasStartedChat,
    // (NEW) Pass a custom onComplete handler to the hook.
    // This function will be called by the hook when a stream for a specific model finishes.
    (modelName) => {
      setStreamCompletion(prev => ({ ...prev, [modelName]: true }));
    }
  );

  // When a new request starts, we must reset the completion status for the selected models.
  useEffect(() => {
    if (isStreaming) {
      const resetState = {};
      selectedModels.forEach(model => {
        resetState[model] = false;
      });
      setStreamCompletion(resetState);
    }
  }, [isStreaming, selectedModels]);

  // uiMode logic remains the same
  useEffect(() => {
    if (
      (Array.isArray(response) && response.some(r => r?.response)) ||
      (Array.isArray(messages) && messages.length > 0) ||
      (Array.isArray(loadingModels) && loadingModels.length > 0)
    ) {
      setUIMode('chat');
    } else {
      setUIMode('center');
    }
  }, [response, messages, loadingModels]);

  // mode-change logic remains the same
  function handleModeChange(newMode) {
    if (newMode === "conversation" && selectedModels.length !== 1) {
      setSelectedModels([]);
    }
    setMode(newMode);
    alertRef.current?.show(
      newMode === "conversation"
        ? "Conversation mode enabled (switching model will reset history)"
        : "One-liner mode enabled",
      toolbarRef.current
    );
  }

  // conversation fallback logic remains the same
  let toShow = null;
  if (mode === "conversation" && selectedModels.length === 1 && messages.length > 0 && !isStreaming) {
    const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
    if (lastAssistant) {
      toShow = [{ provider: selectedModels[0], response: lastAssistant.content }];
    }
  }

  return (
    <>
      <Alert ref={alertRef} />

      {uiMode === 'center' ? (
        <div className="flex flex-col w-full max-w-full px-4 sm:px-6 md:w-2xl md:mx-auto justify-center">
          <div className="bg-primary rounded-3xl shadow-lg w-full">
            <ToolBar
              ref={toolbarRef}
              mode={mode}
              onModeChange={handleModeChange}
              models={models}
              selected={selectedModels}
              setSelected={setSelectedModels}
              resetMessages={setMessages}
              loading={isStreaming}
              disabled={!input?.trim()}
              onSubmit={handleClick}
            />
            <InputCard
              hasStartedChat={hasStartedChat}
              input={input}
              setInput={setInput}
              handleClick={handleClick}
            />
          </div>
        </div>
      ) : (
        <div
          className={`
            flex flex-col mx-auto rounded-3xl shadow-lg relative bg-primary/50 transition-all
            h-[calc(100vh-1rem)] w-full
            ${mode === 'one-liner' && selectedModels.length > 1 ? 'max-w-7xl' : 'max-w-full md:max-w-2xl'}
          `}
        >
          <div
            ref={chatContainerRef}
            className={`
              flex-grow overflow-y-auto min-h-0 w-full mx-auto
              ${mode === 'one-liner' && selectedModels.length > 1 ? 'max-w-7xl' : 'max-w-full md:max-w-2xl'}
            `}
          >
            {/* --- (NEW) Pass the completion state object down to the ResponseCard --- */}
            <ResponseCard
              userQuestion={lastUserQuestion}
              response={toShow || response}
              loadingModels={loadingModels}
              streamCompletion={streamCompletion}
            />
          </div>

          <div className="flex flex-col flex-none w-full max-w-2xl mx-auto items-center bg-primary rounded-3xl shadow-lg max-sm:max-w-full max-sm:rounded-xl">
            <ToolBar
              ref={toolbarRef}
              mode={mode}
              onModeChange={handleModeChange}
              models={models}
              selected={selectedModels}
              setSelected={setSelectedModels}
              resetMessages={setMessages}
              loading={isStreaming}
              disabled={!input?.trim()}
              onSubmit={handleClick}
            />
            <InputCard
              hasStartedChat={hasStartedChat}
              input={input}
              setInput={setInput}
              handleClick={handleClick}
            />
          </div>
        </div>
      )}
    </>
  );
}
