import React, { useState, useRef, useEffect } from "react";
import Alert from "../components/Alert";
import Toolbar from "./ToolBar";
import InputCard from "./InputCard";
import ResponseCard from "./ResponseCard";
import { useChatHistory } from "../hooks/useChatHistory";
import { useStreaming } from "../hooks/useStreaming";
import { sanitizeHistoryForApi, models as modelsConst } from "../utils/chat";

/**
 * Center - before chat starts (keeps a single outer card)
 * Chat   - after chat starts (full-height container)
 */
const Center = ({ children }) =>
    <div className="flex flex-col w-2xl mx-auto justify-center">
        <div className="bg-primary rounded-3xl shadow-lg w-full">{children}</div>
    </div>;

const Chat = ({ children, wide }) =>
    <div
        className={`flex flex-col mx-auto rounded-3xl shadow-lg relative bg-primary/50
                 h-[calc(100vh-1rem)] w-full ${wide ? "max-w-7xl" : "max-w-2xl"}`}
    >
        {children}
    </div>;

/**
 * ControlsInner - the actual toolbar + input (no outer card)
 * Use this inside Center (which already provides the bg-card) and inside ControlsWrapper in Chat.
 */
const ControlsInner = ({
    mode, handleModeChange, toolbarRef,
    models, selectedModels, setSelectedModels,
    loadingModels, handleClick, input, setInput, hasStartedChat
}) => (
    <>
        <div className="flex items-center w-full">
            <Toolbar
                ref={toolbarRef}
                mode={mode}
                models={models}
                selectedModels={selectedModels}
                setSelectedModels={setSelectedModels}
                loading={loadingModels.length > 0}
                onSubmit={handleClick}
                onModeChange={handleModeChange}
            />
        </div>

        <InputCard
            hasStartedChat={hasStartedChat}
            input={input}
            setInput={setInput}
            handleClick={handleClick}
            loading={loadingModels.length > 0}
        />
    </>
);

/**
 * ControlsWrapper - outer card used in Chat mode to pin controls at bottom
 * (gives the same visual card as Center's inner container)
 */
const ControlsWrapper = (props) => (
    <div className="flex-none w-full max-w-2xl mx-auto items-center bg-primary rounded-3xl shadow-lg">
        <ControlsInner {...props} />
    </div>
);

export default function HeroSection({ hasStartedChat, setHasStartedChat }) {
    const alertRef = useRef(null);
    const toolbarRef = useRef(null);

    const [mode, setMode] = useState("one-liner");
    const { messages, setMessages, toShow } = useChatHistory(mode);

    const {
        input, setInput, handleClick,
        response, loadingModels,
        lastUserQuestion, selectedModels, setSelectedModels
    } = useStreaming(
        modelsConst, sanitizeHistoryForApi,
        messages, setMessages,
        mode, setHasStartedChat
    );

    /* welcome toast once */
    useEffect(() => {
        alertRef.current?.show("Welcome! One-liner mode enabled", toolbarRef.current);
    }, []);

    // enforce conversation mode requires exactly one model
    const handleModeChange = (newMode) => {
        if (newMode === "conversation" && (!selectedModels || selectedModels.length !== 1)) {
            setSelectedModels([]); // force user to pick exactly one model in conversation mode
        }
        setMode(newMode);

        alertRef.current?.show(
            newMode === "conversation"
                ? "Conversation mode enabled (switching model will reset history)"
                : "One-liner mode enabled",
            toolbarRef.current
        );
    };

    const wide = mode === "one-liner" && selectedModels.length > 1;

    const hasResponseContent = Array.isArray(response) && response.some(r => r && r.response);
    const hasMessages = Array.isArray(messages) && messages.length > 0;
    const loadingCount = Array.isArray(loadingModels) ? loadingModels.length : 0;

    const uiMode = hasResponseContent || hasMessages || loadingCount > 0 ? "chat" : "center";
    const Layout = uiMode === "center" ? Center : Chat;

    return (
        <>
            <Alert ref={alertRef} />

            <Layout wide={wide}>
                {/* If chat started, Response area grows (scrollable) and controls are pinned at bottom */}
                {uiMode === "chat" ? (
                    <>
                        <div className="flex-grow overflow-y-auto min-h-0">
                            <ResponseCard
                                userQuestion={lastUserQuestion}
                                response={
                                    mode === "conversation" && loadingCount === 0 && toShow
                                        ? toShow
                                        : response
                                }
                                loadingModels={loadingModels}
                            />
                        </div>

                        {/* Controls pinned to bottom as a fixed card (same visual as Center's card) */}
                        <ControlsWrapper
                            mode={mode}
                            handleModeChange={handleModeChange}
                            toolbarRef={toolbarRef}
                            models={modelsConst}
                            selectedModels={selectedModels}
                            setSelectedModels={setSelectedModels}
                            loadingModels={loadingModels}
                            handleClick={handleClick}
                            input={input}
                            setInput={setInput}
                            hasStartedChat={hasStartedChat}
                        />
                    </>
                ) : (
                    // Center mode: show controls inside the centered card (no duplicated outer card)
                    <div>
                        <ControlsInner
                            mode={mode}
                            handleModeChange={handleModeChange}
                            toolbarRef={toolbarRef}
                            models={modelsConst}
                            selectedModels={selectedModels}
                            setSelectedModels={setSelectedModels}
                            loadingModels={loadingModels}
                            handleClick={handleClick}
                            input={input}
                            setInput={setInput}
                            hasStartedChat={hasStartedChat}
                        />
                    </div>
                )}
            </Layout>
        </>
    );
}
