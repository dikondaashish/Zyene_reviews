import { logger } from "@/lib/logger";
import { sendEmail } from "@/services/resend/send-email";
import { supportChatReportEmail, type SupportChatReport } from "@/services/resend/templates/support-chat-report-email";
import { supportChatDb } from "@/services/support-chat/store/support-chat-db";

const WEEK_MS = 7 * 86_400_000;
/** Chat transcripts are kept for six months, then purged with their messages. */
const RETENTION_DAYS = 180;

function reportInbox(): string {
    return process.env.SUPPORT_CHAT_REPORT_INBOX?.trim() || process.env.SUPPORT_CHAT_LEAD_INBOX?.trim() || "zyene.inc@gmail.com";
}

/** Pairs each flagged reply with the visitor question right before it. */
async function flaggedQuestions(since: string): Promise<SupportChatReport["gaps"]> {
    const db = supportChatDb();
    if (!db) return [];
    const { data: flagged, error } = await db
        .from("support_chat_messages")
        .select("id, conversation_id, content, answered, feedback, created_at")
        .eq("role", "assistant")
        .gte("created_at", since)
        .or("answered.eq.false,feedback.eq.-1")
        .order("created_at", { ascending: false })
        .limit(60);
    if (error) throw error;
    if (!flagged?.length) return [];

    const { data: questions, error: qError } = await db
        .from("support_chat_messages")
        .select("conversation_id, content, created_at")
        .eq("role", "user")
        .in("conversation_id", [...new Set(flagged.map((m) => m.conversation_id))])
        .order("created_at", { ascending: false });
    if (qError) throw qError;

    return flagged.map((reply) => ({
        question: questions?.find((q) => q.conversation_id === reply.conversation_id && q.created_at <= reply.created_at)?.content ?? "(question not found)",
        reply: reply.content,
        reason: reply.feedback === -1 ? "thumbs_down" : "unanswered",
    }));
}

async function countSince(table: "support_chat_conversations" | "support_chat_leads", since: string): Promise<number> {
    const db = supportChatDb();
    if (!db) return 0;
    const { count, error } = await db.from(table).select("id", { count: "exact", head: true }).gte("created_at", since);
    if (error) throw error;
    return count ?? 0;
}

async function feedbackCounts(since: string): Promise<{ up: number; down: number }> {
    const db = supportChatDb();
    if (!db) return { up: 0, down: 0 };
    const { data, error } = await db.from("support_chat_messages").select("feedback").gte("feedback_at", since).not("feedback", "is", null);
    if (error) throw error;
    return {
        up: (data ?? []).filter((r) => r.feedback === 1).length,
        down: (data ?? []).filter((r) => r.feedback === -1).length,
    };
}

async function purgeOldConversations(): Promise<number> {
    const db = supportChatDb();
    if (!db) return 0;
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 86_400_000).toISOString();
    const { data, error } = await db.from("support_chat_conversations").delete().lt("last_message_at", cutoff).select("id");
    if (error) throw error;
    return data?.length ?? 0;
}

export async function runSupportChatWeeklyReport(): Promise<{ sent: boolean; gaps: number; purged: number }> {
    const since = new Date(Date.now() - WEEK_MS).toISOString();
    const [conversations, leads, feedback, gaps] = await Promise.all([
        countSince("support_chat_conversations", since),
        countSince("support_chat_leads", since),
        feedbackCounts(since),
        flaggedQuestions(since),
    ]);
    const purged = await purgeOldConversations();
    const { subject, html } = supportChatReportEmail({ conversations, leads, feedback, gaps });
    const result = await sendEmail({ to: reportInbox(), subject, html });
    if (!result.sent) logger.error({ error: result.error }, "[support-chat] weekly report email failed");
    return { sent: result.sent, gaps: gaps.length, purged };
}
