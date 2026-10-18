/**
 * Hand-written types for the support_chat_* tables (migration 20261018190000), in the
 * shape supabase-js expects. database.types.ts is generated and must not be edited;
 * once it is regenerated with these tables, delete this file and use its types.
 */

type ConversationTable = {
    id: string;
    session_id: string;
    first_page_path: string | null;
    lead_name: string | null;
    lead_email: string | null;
    slack_channel_id: string | null;
    slack_thread_ts: string | null;
    human_agent_name: string | null;
    human_takeover_until: string | null;
    created_at: string;
    last_message_at: string;
};

type MessageTable = {
    id: string;
    conversation_id: string;
    role: "user" | "assistant" | "agent";
    content: string;
    intent: "answer" | "handoff" | "off_topic" | null;
    answered: boolean | null;
    agent_name: string | null;
    feedback: number | null;
    feedback_at: string | null;
    created_at: string;
};

type LeadTable = {
    id: string;
    conversation_id: string | null;
    name: string;
    email: string;
    phone: string | null;
    business_type: string | null;
    reason: "question_limit" | "human_request" | "demo_booking";
    page_path: string | null;
    created_at: string;
};

type Table<Row, Required extends keyof Row> = {
    Row: Row;
    Insert: Pick<Row, Required> & Partial<Omit<Row, Required>>;
    Update: Partial<Row>;
    Relationships: [];
};

export type SupportChatDatabase = {
    public: {
        Tables: {
            support_chat_conversations: Table<ConversationTable, "session_id">;
            support_chat_messages: Table<MessageTable, "conversation_id" | "role" | "content">;
            support_chat_leads: Table<LeadTable, "name" | "email" | "reason">;
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
        CompositeTypes: Record<string, never>;
    };
};
