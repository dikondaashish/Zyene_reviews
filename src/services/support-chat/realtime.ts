import { supportChatChannelName, type AgentMessagePayload } from "@/lib/support-chat/realtime-channel";
import { logger } from "@/lib/logger";
import { supportChatDb } from "@/services/support-chat/store/support-chat-db";

/**
 * Pushes a team member's reply to the visitor's open chat over Supabase Realtime
 * broadcast (REST, so no socket is held open on the server). If the visitor is
 * offline it is simply missed live and picked up from history on their next poll.
 */
export async function broadcastAgentMessage(sessionId: string, payload: AgentMessagePayload): Promise<void> {
    const db = supportChatDb();
    if (!db) return;
    try {
        const channel = db.channel(supportChatChannelName(sessionId));
        const result = await channel.httpSend("agent_message", payload, { timeout: 5_000 });
        if (!result.success) logger.warn({ status: result.status }, "[support-chat] realtime broadcast failed");
        await db.removeChannel(channel);
    } catch (err) {
        logger.warn({ err }, "[support-chat] realtime broadcast error");
    }
}
