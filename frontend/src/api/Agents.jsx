

//API connectors for agents

/////////////////////////////     Streaming API functions  ////////////////////////


// NOTE: This version parses typed SSE events (event: token|sources|usage|final|done) and merges into a schema-shaped object (NEW).

// API connectors for agents /////////////////////////////
//     Streaming API functions
////////////////////////
// NOTE: This version parses all typed SSE events (token, sources, usage, final, done)
// and merges them into a single, schema-compliant object for the UI. (NEW)

// API Connector file
// NOTE: The logic for handling 'usage' events and the 'extra' field has been removed. (NEW)

export async function streamChatToPerplexity(message, history, mode, onPartial, onComplete, onError) {
  try {
    const response = await fetch('/stream/perplexity', {
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

    // Frontend accumulation - industry best practice
    let accumulatedAnswer = '';

    const content = {
      answer: '',
      code: null,
      language: null,
      explanation: null,
      sources: null,
      facts: null,
      actions: null,
      nerd_stats: null
    };

    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (readerDone) break;

      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split('\n\n');
      buffer = frames.pop() || '';

      for (const frame of frames) {
        if (!frame) continue;

        let event = 'message';
        let dataStr = '';
        for (const line of frame.split('\n')) {
          if (line.startsWith('event:')) {
            event = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            dataStr = line.slice(5).trim();
          }
        }

        if (!dataStr) continue;

        let payload = null;
        try {
          payload = (dataStr !== '[DONE]') ? JSON.parse(dataStr) : dataStr;
        } catch (e) {
          continue;
        }

        switch (event) {
          case 'token':
            // Frontend accumulates tokens progressively
            if (payload?.answer) {
              accumulatedAnswer += payload.answer;
              content.answer = accumulatedAnswer;
            }
            break;
          case 'sources':
            if (payload?.sources) content.sources = payload.sources;
            break;
          case 'usage':
            if (payload) {
              const newStats = [];
              for (const [key, value] of Object.entries(payload)) {
                newStats.push({ key, value: String(value) });
              }
              content.nerd_stats = newStats;
            }
            break;
          case 'final':
            // Merge metadata only, preserve accumulated answer
            if (typeof payload === 'object') {
              const { answer, ...metadata } = payload;
              Object.assign(content, metadata);
              // Keep accumulatedAnswer, don't overwrite with final answer
            }
            break;
          case 'done':
            onComplete();
            done = true;
            break;
          case 'error':
            onError(payload?.message || 'An unknown error occurred.');
            done = true;
            break;
          default:
            // Handle any untyped events that contain answer tokens
            if (payload?.answer) {
              accumulatedAnswer += payload.answer;
              content.answer = accumulatedAnswer;
            }
            break;
        }

        if (done) break;
        onPartial({ ...content });
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
    
    // Frontend accumulation - industry best practice
    const content = {
      answer: '',
      code: null,
      language: null,
      explanation: null,
      sources: null,
      facts: null,
      actions: null,
      nerd_stats: null
    };

    // Guards to prevent duplicate rendering
    let seenFinal = false;
    
    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (readerDone) break;
      
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split('\n\n');
      buffer = frames.pop() || '';
      
      for (const frame of frames) {
        if (!frame) continue;
        
        let event = 'message';
        let dataStr = '';
        for (const line of frame.split('\n')) {
          if (line.startsWith('event:')) {
            event = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            dataStr = line.slice(5).trim();
          }
        }
        
        if (!dataStr) continue;
        
        let payload = null;
        try {
          payload = (dataStr !== '[DONE]') ? JSON.parse(dataStr) : dataStr;
        } catch (e) {
          continue;
        }
        
        switch (event) {
          case 'token': {
            // Accumulate tokens in frontend, but guard against cumulative chunks
            const incoming = payload?.answer != null ? String(payload.answer) : '';
            if (incoming) {
              // If SDK sends cumulative text, derive delta based on what we've already accumulated
              const delta = incoming.startsWith(content.answer)
                ? incoming.slice(content.answer.length)
                : incoming;
              if (delta) content.answer += delta;
            }
            break;
          }
          
          case 'final': {
            // Merge metadata only (backend final should have empty answer)
            if (!seenFinal && typeof payload === 'object') {
              const { answer, ...meta } = payload;
              Object.assign(content, meta);
              seenFinal = true;
            }
            break;
          }
          
          case 'done':
            onComplete();
            done = true;
            break;
          
          case 'error':
            onError(payload?.message || 'An unknown error occurred.');
            done = true;
            break;
          
          default: {
            // Harden default: treat untyped metadata frames as final-like, else treat as token
            if (payload && typeof payload === 'object') {
              const hasMeta = (
                'sources' in payload ||
                'facts' in payload ||
                'explanation' in payload ||
                'nerd_stats' in payload ||
                'code' in payload ||
                'language' in payload
              );
              if (hasMeta) {
                const { answer, ...meta } = payload;
                Object.assign(content, meta);
              } else if (payload.answer != null) {
                const incoming = String(payload.answer);
                const delta = incoming.startsWith(content.answer)
                  ? incoming.slice(content.answer.length)
                  : incoming;
                if (delta) content.answer += delta;
              }
            }
            break;
          }
        }
        
        if (done) break;
        onPartial({ ...content });
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
    
    const content = {
      answer: '',
      code: null,
      language: null,
      explanation: null,
      sources: null,
      facts: null,
      actions: null,
      nerd_stats: null
    };
    
    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (readerDone) break;
      
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split('\n\n');
      buffer = frames.pop() || '';
      
      for (const frame of frames) {
        if (!frame) continue;
        
        let event = 'message';
        let dataStr = '';
        for (const line of frame.split('\n')) {
          if (line.startsWith('event:')) {
            event = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            dataStr = line.slice(5).trim();
          }
        }
        
        if (!dataStr) continue;
        
        let payload = null;
        try {
          payload = (dataStr !== '[DONE]') ? JSON.parse(dataStr) : dataStr;
        } catch (e) {
          continue;
        }
        
        switch (event) {
          case 'token':
            if (payload?.answer) content.answer += payload.answer;
            break;
          case 'final':
            if (typeof payload === 'object') {
              Object.assign(content, {
                ...payload,
                answer: content.answer
              });
            }
            break;
          case 'done':
            onComplete();
            done = true;
            break;
          case 'error':
            onError(payload?.message || 'An unknown error occurred.');
            done = true;
            break;
          default:
            if (payload?.answer) content.answer += payload.answer;
            break;
        }
        
        if (done) break;
        onPartial({ ...content });
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
    
    const content = {
      answer: '',
      code: null,
      language: null,
      explanation: null,
      sources: null,
      facts: null,
      actions: null,
      nerd_stats: null
    };
    
    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (readerDone) break;
      
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split('\n\n');
      buffer = frames.pop() || '';
      
      for (const frame of frames) {
        if (!frame) continue;
        
        let event = 'message';
        let dataStr = '';
        for (const line of frame.split('\n')) {
          if (line.startsWith('event:')) {
            event = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            dataStr = line.slice(5).trim();
          }
        }
        
        if (!dataStr) continue;
        
        let payload = null;
        try {
          payload = (dataStr !== '[DONE]') ? JSON.parse(dataStr) : dataStr;
        } catch (e) {
          continue;
        }
        
        switch (event) {
          case 'token':
            if (payload?.answer) content.answer += payload.answer;
            break;
          case 'final':
            if (typeof payload === 'object') {
              Object.assign(content, {
                ...payload,
                answer: content.answer
              });
            }
            break;
          case 'done':
            onComplete();
            done = true;
            break;
          case 'error':
            onError(payload?.message || 'An unknown error occurred.');
            done = true;
            break;
          default:
            if (payload?.answer) content.answer += payload.answer;
            break;
        }
        
        if (done) break;
        onPartial({ ...content });
      }
    }
  } catch (error) {
    onError(error.message);
  }
}
