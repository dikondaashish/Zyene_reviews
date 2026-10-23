import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { REVIEW_RESPONSE_SOURCE_ZYENE_AUTO } from "@/lib/reviews/response-source";
import { buildRecentAutomations, type RecentAutomation, type RecentAutomationsInput } from "@/lib/dashboard/recent-automations";

const WINDOW_MS = 30 * 86_400_000;

/** Last 30 days of finished automation work, read with the caller's RLS client. Fails soft to an empty list. */
export async function loadRecentAutomations(supabase: SupabaseClient, businessId: string, now = new Date()): Promise<RecentAutomation[]> {
    const since = new Date(now.getTime() - WINDOW_MS).toISOString();
    try {
        const [autoReplies, drafts, messages] = await Promise.all([
            supabase.from("reviews").select("id, author_name, rating, responded_at")
                .eq("business_id", businessId).eq("response_source", REVIEW_RESPONSE_SOURCE_ZYENE_AUTO)
                .gte("responded_at", since).order("responded_at", { ascending: false }).limit(6),
            supabase.from("review_reply_drafts").select("id, posted_at, reviews(author_name, rating)")
                .eq("business_id", businessId).eq("status", "posted")
                .gte("posted_at", since).order("posted_at", { ascending: false }).limit(6),
            supabase.from("review_request_messages").select("id, step, channel, status, created_at, review_requests(customer_name)")
                .eq("business_id", businessId).in("status", ["sent", "delivered"])
                .gte("created_at", since).order("created_at", { ascending: false }).limit(6),
        ]);
        // Embedded rows arrive as an object or a one-item array depending on the relationship.
        const one = <T,>(value: unknown): T | null => ((Array.isArray(value) ? value[0] : value) as T | undefined) ?? null;
        const input: RecentAutomationsInput = {
            autoReplies: (autoReplies.data ?? []) as RecentAutomationsInput["autoReplies"],
            approvedReplies: (drafts.data ?? []).map((d) => ({
                id: d.id as string, posted_at: d.posted_at as string | null,
                reviews: one<NonNullable<RecentAutomationsInput["approvedReplies"][number]["reviews"]>>(d.reviews),
            })),
            messages: (messages.data ?? []).map((m) => ({
                id: m.id as string, step: Number(m.step), channel: m.channel as string, status: m.status as string,
                created_at: m.created_at as string,
                customer_name: one<{ customer_name: string | null }>(m.review_requests)?.customer_name ?? null,
            })),
        };
        return buildRecentAutomations(input);
    } catch (err) {
        logger.warn({ err, businessId }, "[dashboard] recent automations load failed");
        return [];
    }
}
