import React, { useState, useRef, useEffect } from "react";
import { useStreaming } from "../hooks/useStreaming";
import { sanitizeHistoryForApi, models as modelsConst } from "../utils/chat";
import InputCard from './InputCard';
import ToolBar from "./ToolBar";
import ResponseCard from "./ResponseCard";
import Alert from "../components/Alert";

/**
 * HeroSection
 *
 * - Uses useStreaming hook for all streaming logic (signature preserved)
 * - Keeps UI layout and exact center/chat mode logic from your original file
 * - Uses sanitizeHistoryForApi imported from utils/chat
 *
 * Styling changes only: mobile-first responsive classes, consistent paddings,
 * fixed-height controls, and a flexible scrollable response area.
 */

export default function HeroSection({ hasStartedChat, setHasStartedChat }) {
  // models (kept same)
  const models = modelsConst || ["Sonar", "Gemini", "R1", "Qwen"];

  // refs for alert / toolbar (same)
  const alertRef = useRef();
  const toolbarRef = useRef(null);

  useEffect(() => {
    alertRef.current?.show("Welcome! One-liner mode enabled", toolbarRef.current);
  }, []);

  // message history (keeps same)
  const [messages, setMessages] = useState([]); // array of { role, content }

  // mode (conversation | one-liner)
  const [mode, setMode] = useState("one-liner");

  // UI mode (center | chat)
  const [uiMode, setUIMode] = useState('center');

  const chatContainerRef = useRef(null);

  // useStreaming hook (signature preserved)
  const {
    input, setInput, handleClick,
    response, loadingModels,
    lastUserQuestion, selectedModels, setSelectedModels,
    isStreaming
  } = useStreaming(
    models,
    sanitizeHistoryForApi,
    messages, setMessages,
    mode, setHasStartedChat
  );

  // preserve original uiMode logic exactly
  useEffect(() => {
    if (
      Array.isArray(response) && response.some(r => r && r.response) ||
      Array.isArray(messages) && messages.length > 0 ||
      Array.isArray(loadingModels) && loadingModels.length > 0
    ) {
      setUIMode('chat');
    } else {
      setUIMode('center');
    }
  }, [response, messages, loadingModels]);

  // preserve original mode-change logic exactly (uses newMode)
  function handleModeChange(newMode) {
    if (newMode === "conversation" && selectedModels.length !== 1) {
      // If switching to conversation with none or more than one model selected → reset to empty
      setSelectedModels([]);
    }
    setMode(newMode);

    //Show alert on toggle (use newMode)
    alertRef.current?.show(
      newMode === "conversation"
        ? "Conversation mode enabled (switching model will reset history)"
        : "One-liner mode enabled",
      toolbarRef.current
    );
  }

  // conversation fallback toShow logic (exactly as original)
  let toShow = null;
  if (mode === "conversation" && selectedModels.length === 1 && messages.length > 0 && !isStreaming) {
    const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
    if (lastAssistant) {
      toShow = [{ provider: selectedModels[0], response: lastAssistant.content }];
    }
  }

  return (
    <>
      {/* Portal / alert (unchanged logic) */}
      <Alert ref={alertRef} />

      {uiMode === 'center' ? (
        // Before chat starts: only show input & controls, centered vertically
        // Mobile-first: full width with horizontal padding, constrained at md+
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
                loading={Array.isArray(loadingModels) && loadingModels.length > 0}
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
        // After chat starts: full container with response and controls
        // Mobile-first: full-width, constrained on medium+ screens.
        // The response area grows; controls remain visually identical in size.
        <div
          className={`
            flex flex-col mx-auto rounded-3xl shadow-lg relative bg-primary/50 transition-all
            h-[calc(100vh-1rem)] w-full
            ${mode === 'one-liner' && selectedModels.length > 1 ? 'max-w-7xl' : 'max-w-full md:max-w-2xl'}
          `}
        >
          {/* Response area: flexible, scrollable, with sensible padding on small screens */}
          <div
            ref={chatContainerRef}
            className={`
              flex-grow overflow-y-auto min-h-0 w-full mx-auto
              ${mode === 'one-liner' && selectedModels.length > 1 ? 'max-w-7xl' : 'max-w-full md:max-w-2xl'}
            `}
          >
            <ResponseCard
              userQuestion={lastUserQuestion}
              response={toShow || response}
              loadingModels={loadingModels}
            />
          </div>

          {/* Controls wrapper: pinned at bottom of the container, fixed visual size */}
          <div className="flex flex-col flex-none w-full max-w-2xl mx-auto items-center bg-primary rounded-3xl shadow-lg max-sm:max-w-full max-sm:rounded-xl">
            <ToolBar
                ref={toolbarRef}
                mode={mode}
                onModeChange={handleModeChange}
                models={models}
                selected={selectedModels}
                setSelected={setSelectedModels}
                resetMessages={setMessages}
                loading={Array.isArray(loadingModels) && loadingModels.length > 0}
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
