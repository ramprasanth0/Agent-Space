import {
  sendChatToPerplexity,
  sendChatToGemini,
  sendChatToDeepSeek,
  sendChatToQwen,
  sendChatToMultiAgent,
} from '../../src/api/agents';

// Helper to reset fetch mock for every test
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('API Connector Functions', () => {
  const query = 'hello?';
  const history = [{ role: 'user', content: 'previous' }];
  const mode = 'default';
  const agents = ['agent1', 'agent2'];
  const fakeResponse = { result: 'ok', content: 'hello back' };

  function mockFetchSuccess(data = fakeResponse) {
    // Setup fetch mock to resolve to a Response with .json()
    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(data),
    });
  }

  test('sendChatToPerplexity: calls correct endpoint, returns data', async () => {
    mockFetchSuccess();
    const result = await sendChatToPerplexity(query, history, mode);

    expect(global.fetch).toHaveBeenCalledWith(
      '/chat/perplexity',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, history, mode }),
      })
    );
    expect(result).toEqual(fakeResponse);
  });

  test('sendChatToGemini: calls correct endpoint, returns data', async () => {
    mockFetchSuccess();
    const result = await sendChatToGemini(query, history, mode);
    expect(global.fetch).toHaveBeenCalledWith(
      '/chat/gemini',
      expect.any(Object)
    );
    expect(result).toEqual(fakeResponse);
  });

  test('sendChatToDeepSeek: calls correct endpoint, returns data', async () => {
    mockFetchSuccess();
    const result = await sendChatToDeepSeek(query, history, mode);
    expect(global.fetch).toHaveBeenCalledWith(
      '/chat/deepseek',
      expect.any(Object)
    );
    expect(result).toEqual(fakeResponse);
  });

  test('sendChatToQwen: calls correct endpoint, returns data', async () => {
    mockFetchSuccess();
    const result = await sendChatToQwen(query, history, mode);
    expect(global.fetch).toHaveBeenCalledWith(
      '/chat/qwen',
      expect.any(Object)
    );
    expect(result).toEqual(fakeResponse);
  });

  test('sendChatToMultiAgent: calls correct endpoint, returns data', async () => {
    mockFetchSuccess();
    const result = await sendChatToMultiAgent(query, agents);
    expect(global.fetch).toHaveBeenCalledWith(
      '/chat/multi_agent',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, agents }),
      })
    );
    expect(result).toEqual(fakeResponse);
  });
});