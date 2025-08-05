

//API connectors for agents
export async function sendChatToPerplexity(query, historyToSend, mode) {
    const payload = { 
      message: query, 
      history: historyToSend, 
      mode: mode 
    };
    console.log("Sending payload to backend:", JSON.stringify(payload, null, 2));
    const result = await fetch('/chat/perplexity',{
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, history:historyToSend, mode: mode }),
    })

    const data = await result.json();
    console.log(data);
    return data
}

export async function sendChatToGemini(query, historyToSend, mode) {
    const result = await fetch('/chat/gemini',{
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, history:historyToSend, mode: mode  }),
    })

    const data = await result.json();
    console.log(data);
    return data
}

export async function sendChatToDeepSeek(query, historyToSend, mode) {
    const result = await fetch('/chat/deepseek',{
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, history: historyToSend, mode: mode  }),
    })

    const data = await result.json();
    console.log(data);
    return data
}

export async function sendChatToQwen(query, historyToSend, mode) {
    const result = await fetch('/chat/qwen',{
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, history :historyToSend, mode: mode  }),
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