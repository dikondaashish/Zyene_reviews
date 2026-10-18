/**
 * Realtime broadcast channel per conversation. The session id is 24 random hex
 * characters known only to the visitor's browser, so the channel name is not guessable.
 */
export function supportChatChannelName(sessionId: string): string {
    return `support-chat:${sessionId}`;
}

export interface AgentMessagePayload {
    id: string;
    agentName: string;
    content: string;
    createdAt: string;
}
