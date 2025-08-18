

//API connectors for agents

/////////////////////////////     Streaming API functions  ////////////////////////


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


export async function streamChatToGemini(message, history, mode, onPartial, onComplete, onError) {
  try {
    const response = await fetch('/stream/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, mode })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    // REMOVE: let accumulatedAnswer = ''; // Don't accumulate on frontend

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();

          if (data === '[DONE]') {
            onComplete();
            return;
          }

          try {
            const parsed = JSON.parse(data);

            if (parsed.sources || parsed.facts || parsed.explanation) {
              onPartial(parsed); // Final structured response
            } else if (parsed.answer !== undefined) {
              // CHANGED: Just pass the already-accumulated answer from backend
              onPartial({ answer: parsed.answer });
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


export async function streamChatToDeepSeek(message, history, mode, onPartial, onComplete, onError) {
  try {
    const response = await fetch('/stream/deepseek', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, mode })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

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
          const data = line.slice(6).trim();

          if (data === '[DONE]') {
            onComplete();
            return;
          }

          try {
            const parsed = JSON.parse(data);

            if (parsed.sources || parsed.facts || parsed.explanation) {
              // Final structured response
              onPartial(parsed);
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

export async function streamChatToQwen(message, history, mode, onPartial, onComplete, onError) {
  try {
    const response = await fetch('/stream/qwen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, mode })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

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
          const data = line.slice(6).trim();

          if (data === '[DONE]') {
            onComplete();
            return;
          }

          try {
            const parsed = JSON.parse(data);

            if (parsed.sources || parsed.facts || parsed.explanation) {
              // Final structured response
              onPartial(parsed);
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
