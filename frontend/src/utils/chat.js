// tree-shakable constants
export const models = ["Sonar", "Gemini", "R1", "Qwen"];

/** Strip objects/undefined from history so the backend sees plain strings */
export function sanitizeHistoryForApi(messages) {
    return messages.map(msg => {
        let content = '';

        // Handle undefined/null content properly
        if (msg.content === undefined || msg.content === null) {
            console.warn('sanitizeHistoryForApi: message content is undefined/null:', msg);
            content = '';
        } else if (typeof msg.content === 'object' && msg.content !== null) {
            content = msg.content.answer || '';
        } else if (typeof msg.content === 'string') {
            content = msg.content;
        } else {
            console.warn('sanitizeHistoryForApi: unexpected content type:', typeof msg.content, msg.content);
            content = String(msg.content);
        }

        return {
            role: msg.role,
            content: content.trim()
        };
    }).filter(msg => {
        // Filter out messages with empty content
        const isValid = msg.content && msg.content.trim() !== '' && msg.role;
        if (!isValid) {
            console.warn('Filtering out invalid message:', msg);
        }
        return isValid;
    });
};