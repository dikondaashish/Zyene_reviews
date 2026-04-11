import type { GoogleReview } from "@/services/google/business-profile";
import { inngest } from "@/services/inngest/client";

export type AutoReplyBusinessSettings = {
    auto_reply_enabled: boolean;
    auto_reply_min_rating: number;
    auto_reply_tone: string;
    /** Set when the user turns auto-reply on; reviews must be newer than this on Google's timeline. */
    auto_reply_enabled_at: string | null;
};

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
    if (!settings?.auto_reply_enabled || !upsertedReviewId) return false;
    if (!settings.auto_reply_enabled_at) return false;
    if (googleReview.reviewReply) return false;
    if (numericRating < settings.auto_reply_min_rating) return false;
    const created = new Date(googleReview.createTime);
    if (Number.isNaN(created.getTime())) return false;
    if (Date.now() - created.getTime() > AUTO_REPLY_MAX_REVIEW_AGE_MS) return false;
    const cutoff = new Date(settings.auto_reply_enabled_at).getTime() - AUTO_REPLY_ENABLED_AT_SKEW_MS;
    if (created.getTime() < cutoff) return false;
    return true;
}

export async function enqueueAutoReplyJob(reviewId: string): Promise<void> {
    await inngest.send({
        name: "review/auto-reply",
        data: { reviewId },
    });
}
