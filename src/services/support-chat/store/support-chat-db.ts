import { createClient } from "@supabase/supabase-js";

import { logger } from "@/lib/logger";
import type { SupportChatDatabase } from "@/services/support-chat/store/support-chat-schema";

/**
 * Service-role client for the support_chat_* tables (migration 20261018190000), typed
 * by a local schema until database.types.ts is regenerated with these tables.
 */
let client: ReturnType<typeof createClient<SupportChatDatabase>> | null | undefined;

export function supportChatDb() {
    if (client !== undefined) return client;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    client = url && key ? createClient<SupportChatDatabase>(url, key, { auth: { autoRefreshToken: false, persistSession: false } }) : null;
    return client;
}

let warned = false;

/**
 * Chat storage is best-effort: a missing table (migration not applied yet) or a
 * database blip must never stop Natalie from answering. Logs once, then quietly.
 */
export function reportStoreError(operation: string, err: unknown): void {
    if (warned) return;
    warned = true;
    logger.warn({ err, operation }, "[support-chat] storage unavailable; continuing without it");
}

export interface ConversationRow {
    id: string;
    session_id: string;
    lead_name: string | null;
    lead_email: string | null;
    slack_channel_id: string | null;
    slack_thread_ts: string | null;
    human_agent_name: string | null;
    human_takeover_until: string | null;
}

export interface MessageRow {
    id: string;
    conversation_id: string;
    role: "user" | "assistant" | "agent";
    content: string;
    intent: string | null;
    answered: boolean | null;
    agent_name: string | null;
    feedback: number | null;
    created_at: string;
}

export const CONVERSATION_COLUMNS =
    "id, session_id, lead_name, lead_email, slack_channel_id, slack_thread_ts, human_agent_name, human_takeover_until";
