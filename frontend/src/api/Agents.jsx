

//API connectors for agents
export async function sendChatToPerplexity(query, historyToSend, mode) {
    const payload = {
        message: query,
        history: historyToSend,
        mode: mode
    };
    console.log("Sending payload to backend:", JSON.stringify(payload, null, 2));
    const result = await fetch('/chat/perplexity', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, history: historyToSend, mode: mode }),
    })

    const data = await result.json();
    console.log(data);
    return data
}

export async function sendChatToGemini(query, historyToSend, mode) {
    const result = await fetch('/chat/gemini', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, history: historyToSend, mode: mode }),
    })

    const data = await result.json();
    console.log(data);
    return data
}

export async function sendChatToDeepSeek(query, historyToSend, mode) {
    const result = await fetch('/chat/deepseek', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, history: historyToSend, mode: mode }),
    })

    const data = await result.json();
    console.log(data);
    return data
}

export async function sendChatToQwen(query, historyToSend, mode) {
    const result = await fetch('/chat/qwen', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, history: historyToSend, mode: mode }),
    })

    const data = await result.json();
    console.log(data);
    return data
}

export async function sendChatToMultiAgent(query, agents) {
    const result = await fetch('/chat/multi_agent', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, agents: agents }),
    })

    const data = await result.json();
    console.log(data);
    return data
}

export async function streamChatToPerplexity(message, history, mode, onPartial, onComplete, onError) {
  try {
    const response = await fetch('/stream/perplexity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, mode })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let accumulatedAnswer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            onComplete();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            
            if (parsed.structured) {
              // Final structured response
              onPartial(parsed.structured);
            } else if (parsed.answer !== undefined) {
              // Streaming token
              accumulatedAnswer += parsed.answer;
              onPartial({ answer: accumulatedAnswer });
            } else if (parsed.error) {
              onError(parsed.error);
              return;
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      }
    }
  } catch (error) {
    onError(error.message);
  }
}