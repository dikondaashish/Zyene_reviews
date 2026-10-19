import {
    CONVERSATION_COLUMNS,
    reportStoreError,
    supportChatDb,
    type ConversationRow,
    type MessageRow,
} from "@/services/support-chat/store/support-chat-db";

/** A takeover is active while a team member replied recently. */
export function activeHumanAgent(conversation: ConversationRow | null): string | null {
    if (!conversation?.human_agent_name || !conversation.human_takeover_until) return null;
    return new Date(conversation.human_takeover_until).getTime() > Date.now() ? conversation.human_agent_name : null;
}

export async function ensureConversation(sessionId: string, pagePath?: string): Promise<ConversationRow | null> {
    const db = supportChatDb();
    if (!db) return null;
    try {
        const { data, error } = await db
            .from("support_chat_conversations")
            .upsert(
                { session_id: sessionId, first_page_path: pagePath ?? null, last_message_at: new Date().toISOString() },
                { onConflict: "session_id", ignoreDuplicates: false },
            )
            .select(CONVERSATION_COLUMNS)
            .single();
        if (error) throw error;
        return data as ConversationRow;
    } catch (err) {
        reportStoreError("ensureConversation", err);
        return null;
    }
}

export async function getConversation(sessionId: string): Promise<ConversationRow | null> {
    const db = supportChatDb();
    if (!db) return null;
    const { data, error } = await db
        .from("support_chat_conversations")
        .select(CONVERSATION_COLUMNS)
        .eq("session_id", sessionId)
        .maybeSingle();
    if (error) {
        reportStoreError("getConversation", error);
        return null;
    }
    return data as ConversationRow | null;
}

export async function insertMessage(
    conversationId: string,
    message: Pick<MessageRow, "role" | "content"> & {
        intent?: "answer" | "handoff" | "off_topic";
        answered?: boolean;
        agent_name?: string;
    },
): Promise<string | null> {
    const db = supportChatDb();
    if (!db) return null;
    const { data, error } = await db
        .from("support_chat_messages")
        .insert({ conversation_id: conversationId, ...message, content: message.content.slice(0, 4000) })
        .select("id")
        .single();
    if (error) {
        reportStoreError("insertMessage", error);
        return null;
    }
    return (data as { id: string }).id;
}

/** Only accepts feedback on an assistant reply that belongs to the caller's own conversation. */
export async function setReplyFeedback(sessionId: string, messageId: string, rating: 1 | -1): Promise<boolean> {
    const conversation = await getConversation(sessionId);
    const db = supportChatDb();
    if (!conversation || !db) return false;
    const { data, error } = await db
        .from("support_chat_messages")
        .update({ feedback: rating, feedback_at: new Date().toISOString() })
        .eq("id", messageId)
        .eq("conversation_id", conversation.id)
        .eq("role", "assistant")
        .select("id");
    if (error) {
        reportStoreError("setReplyFeedback", error);
        return false;
    }
    return Array.isArray(data) && data.length > 0;
}

export async function updateConversation(conversationId: string, patch: Partial<Omit<ConversationRow, "id" | "session_id">>) {
    const db = supportChatDb();
    if (!db) return;
    const { error } = await db.from("support_chat_conversations").update(patch).eq("id", conversationId);
    if (error) reportStoreError("updateConversation", error);
}

export async function findConversationByThread(channelId: string, threadTs: string): Promise<ConversationRow | null> {
    const db = supportChatDb();
    if (!db) return null;
    const { data, error } = await db
        .from("support_chat_conversations")
        .select(CONVERSATION_COLUMNS)
        .eq("slack_channel_id", channelId)
        .eq("slack_thread_ts", threadTs)
        .maybeSingle();
    if (error) reportStoreError("findConversationByThread", error);
    return (data as ConversationRow | null) ?? null;
}

/** Team replies newer than `since`, for a visitor whose live connection dropped. */
export async function listAgentMessages(sessionId: string, since: string): Promise<MessageRow[]> {
    const conversation = await getConversation(sessionId);
    const db = supportChatDb();
    if (!conversation || !db) return [];
    const { data, error } = await db
        .from("support_chat_messages")
        .select("id, conversation_id, role, content, intent, answered, agent_name, feedback, created_at")
        .eq("conversation_id", conversation.id)
        .eq("role", "agent")
        .gt("created_at", since)
        .order("created_at", { ascending: true })
        .limit(20);
    if (error) reportStoreError("listAgentMessages", error);
    return (data as MessageRow[] | null) ?? [];
}
