import { useState, useMemo } from "react";

export function useChatHistory(mode) {
    const [messages, setMessages] = useState([]);

    const toShow = useMemo(() => {
        if (mode !== "conversation") return null;
        const last = [...messages].reverse().find(m => m.role === "assistant");
        return last
            ? [{ provider: last.provider, response: last.content }]
            : null;
    }, [mode, messages]);

    return { messages, setMessages, toShow };
}
