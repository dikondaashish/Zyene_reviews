import { reportStoreError, supportChatDb } from "@/services/support-chat/store/support-chat-db";

export interface StoredLead {
    conversationId: string | null;
    name: string;
    email: string;
    phone?: string;
    businessType?: string;
    reason: "question_limit" | "human_request" | "demo_booking";
    pagePath?: string;
}

/** Keeps a copy of every chat lead in the database, alongside the inbox email. */
export async function saveLead(lead: StoredLead): Promise<void> {
    const db = supportChatDb();
    if (!db) return;
    const { error } = await db.from("support_chat_leads").insert({
        conversation_id: lead.conversationId,
        name: lead.name,
        email: lead.email,
        phone: lead.phone ?? null,
        business_type: lead.businessType ?? null,
        reason: lead.reason,
        page_path: lead.pagePath ?? null,
    });
    if (error) reportStoreError("saveLead", error);
}
