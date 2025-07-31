

//API connectors for agents
export async function sendChatToPerplexity(query) {
    const result = await fetch('/chat/perplexity',{
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
    })

    const data = await result.json();
    console.log(data);
    return data
}

export async function sendChatToGemini(query) {
    const result = await fetch('/chat/gemini',{
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
    })

    const data = await result.json();
    console.log(data);
    return data
}

export async function sendChatToDeepSeek(query) {
    const result = await fetch('/chat/deepseek',{
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
    })

    const data = await result.json();
    console.log(data);
    return data
}

export async function sendChatToQwen(query) {
    const result = await fetch('/chat/qwen',{
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
    })

    const data = await result.json();
    console.log(data);
    return data
}

export async function sendChatToMultiAgent(query, agents) {
    const result = await fetch('/chat/multi_agent',{
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query ,agents:agents}),
    })

    const data = await result.json();
    console.log(data);
    return data
}