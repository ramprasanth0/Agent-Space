import React, { useState, useRef, useEffect } from "react";
import Alert from "../components/Alert";
import Toolbar from "./ToolBar";
import InputCard from "./InputCard";
import ResponseCard from "./ResponseCard";
import { useChatHistory } from "../hooks/useChatHistory";
import { useStreaming } from "../hooks/useStreaming";
import { sanitizeHistoryForApi, models as modelsConst } from "../utils/chat";

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

    // NEW: wrapper that enforces "conversation mode must have exactly one model"
    const handleModeChange = (newMode) => {
        // if switching to conversation and selectedModels is not exactly 1 -> reset
        if (newMode === "conversation" && (!selectedModels || selectedModels.length !== 1)) {
            setSelectedModels([]); // force user to pick exactly one model in conversation mode
        }
        setMode(newMode);

        // preserve your alert behavior
        alertRef.current?.show(
            newMode === "conversation"
                ? "Conversation mode enabled (switching model will reset history)"
                : "One-liner mode enabled",
            toolbarRef.current
        );
    };

    const wide = mode === "one-liner" && selectedModels.length > 1;
    const uiMode =
        (Array.isArray(response) && response.some(r => r && r.response)) ||
            (Array.isArray(messages) && messages.length) ||
            (Array.isArray(loadingModels) && loadingModels.length)
            ? "chat"
            : "center";
    const Layout = uiMode === "center" ? Center : Chat;

    return (
        <>
            <Alert ref={alertRef} />

            <Layout wide={wide}>
                {uiMode === "chat" &&
                    <div className="flex-grow overflow-y-auto">
                        <ResponseCard
                            userQuestion={lastUserQuestion}
                            response={
                                mode === "conversation" && (!loadingModels || loadingModels.length === 0) && toShow
                                    ? toShow
                                    : response
                            }
                            loadingModels={loadingModels}
                        />
                    </div>
                }

                {/* Pass the wrapper here (not raw setMode) */}
                <Toolbar
                    ref={toolbarRef}
                    mode={mode}
                    models={modelsConst}
                    selectedModels={selectedModels}
                    setSelectedModels={setSelectedModels}
                    loading={loadingModels.length > 0}
                    onSubmit={handleClick}
                    onModeChange={handleModeChange}
                />

                <InputCard
                    hasStartedChat={hasStartedChat}
                    input={input}
                    setInput={setInput}
                    handleClick={handleClick}
                />
            </Layout>
        </>
    );
}
