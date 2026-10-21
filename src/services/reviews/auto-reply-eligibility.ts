import type { SupabaseClient } from "@supabase/supabase-js";
import type { GoogleReview } from "@/services/google/business-profile";
import { inngest } from "@/services/inngest/client";

export type AutoReplyBusinessSettings = {
    auto_reply_enabled: boolean;
    auto_reply_min_rating: number;
    auto_reply_tone: string;
    /** Set when the user turns auto-reply on; reviews must be newer than this on Google's timeline. */
    auto_reply_enabled_at: string | null;
    /** Per-star reply rules (approval / auto / template / ignore) replace the single threshold. */
    reply_rules_enabled?: boolean | null;
    reply_rules_enabled_at?: string | null;
};

export async function loadAutoReplySettings(admin: SupabaseClient, businessId: string): Promise<AutoReplyBusinessSettings | null> {
    const { data } = await admin.from("businesses")
        .select("auto_reply_enabled, auto_reply_enabled_at, auto_reply_min_rating, auto_reply_tone, reply_rules_enabled, reply_rules_enabled_at")
        .eq("id", businessId).maybeSingle();
    return (data ?? null) as AutoReplyBusinessSettings | null;
}

/** Slack so a review posted just before toggle + webhook delay still qualifies. */
export const AUTO_REPLY_ENABLED_AT_SKEW_MS = 3 * 60 * 1000;

/** Safety cap so stale queue items cannot post to ancient reviews. */
export const AUTO_REPLY_MAX_REVIEW_AGE_MS = 14 * 24 * 60 * 60 * 1000;

export function reviewQualifiesForAutoReplyEnqueue(
    googleReview: GoogleReview,
    numericRating: number,
    settings: AutoReplyBusinessSettings | null | undefined,
    upsertedReviewId: string | undefined
): boolean {
    if (!settings || !upsertedReviewId) return false;
    const rules = Boolean(settings.reply_rules_enabled);
    const enabledAt = rules ? settings.reply_rules_enabled_at : settings.auto_reply_enabled_at;
    if (!rules && !settings.auto_reply_enabled) return false;
    if (!enabledAt) return false;
    if (googleReview.reviewReply) return false;
    // With rules on, every rating is routed (approval / auto / template / ignore) by the worker.
    if (!rules && numericRating < settings.auto_reply_min_rating) return false;
    const created = new Date(googleReview.createTime);
    if (Number.isNaN(created.getTime())) return false;
    if (Date.now() - created.getTime() > AUTO_REPLY_MAX_REVIEW_AGE_MS) return false;
    const cutoff = new Date(enabledAt).getTime() - AUTO_REPLY_ENABLED_AT_SKEW_MS;
    if (created.getTime() < cutoff) return false;
    return true;
}

export async function enqueueAutoReplyJob(reviewId: string): Promise<void> {
    // Stable id: re-syncing the same unreplied review cannot queue a second reply job.
    await inngest.send({
        id: `auto-reply:${reviewId}`,
        name: "review/auto-reply",
        data: { reviewId },
    });
}
