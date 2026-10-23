import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import type { ReplyRuleSummaryInput } from "@/lib/reviews/reply-rules-summary";

export type ReplyRulesSummary = {
    enabled: boolean;
    /** One entry per star rating, 1 to 5. Unset ratings default to approval. */
    rules: ReplyRuleSummaryInput[];
    pendingApprovals: number;
};

export const EMPTY_REPLY_RULES_SUMMARY: ReplyRulesSummary = {
    enabled: false,
    rules: [1, 2, 3, 4, 5].map((rating) => ({ rating, action: "approval" })),
    pendingApprovals: 0,
};

/** Reads with the caller's RLS client; members of the business can read rules and drafts. */
export async function loadReplyRulesSummary(supabase: SupabaseClient, businessId: string): Promise<ReplyRulesSummary> {
    try {
        const [business, rules, drafts] = await Promise.all([
            supabase.from("businesses").select("reply_rules_enabled").eq("id", businessId).maybeSingle(),
            supabase.from("review_reply_rules").select("rating, action").eq("business_id", businessId),
            supabase.from("review_reply_drafts").select("id", { count: "exact", head: true })
                .eq("business_id", businessId).in("status", ["pending", "failed"]),
        ]);
        const byRating = new Map((rules.data ?? []).map((r) => [r.rating as number, r.action as string]));
        return {
            enabled: Boolean(business.data?.reply_rules_enabled),
            rules: [1, 2, 3, 4, 5].map((rating) => ({ rating, action: byRating.get(rating) ?? "approval" })),
            pendingApprovals: drafts.count ?? 0,
        };
    } catch (err) {
        logger.warn({ err, businessId }, "[reply-rules] summary load failed");
        return EMPTY_REPLY_RULES_SUMMARY;
    }
}
