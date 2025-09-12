import { logToBackend } from '../../src/utils/logger';

describe('Logger Utility', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
        global.console.error = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('sends logs to backend successfully', async () => {
        global.fetch.mockResolvedValueOnce({ ok: true });
        
        await logToBackend('INFO', 'Test message', { extra: 'data' });
        
        expect(global.fetch).toHaveBeenCalledWith(
            `${import.meta.env.VITE_BACKEND_URL}/api/frontend-logs`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    level: 'INFO',
                    message: 'Test message',
                    extra: { extra: 'data' }
                })
            }
        );
    });

    test('handles network errors gracefully', async () => {
        const error = new Error('Network error');
        global.fetch.mockRejectedValueOnce(error);
        
        await logToBackend('ERROR', 'Test error');
        
        expect(console.error).toHaveBeenCalledWith(
            'Failed to send frontend log to backend',
            error
        );
    });
});