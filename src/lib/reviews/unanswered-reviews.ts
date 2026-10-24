/**
 * One meaning of "needs a reply" and "unhappy" for every review count the owner sees, matching
 * the Reviews inbox's Needs response tab, so the dashboard, waiting card, attention list and
 * inbox always agree.
 *
 * Needs a reply: visible, status "pending" and no reply posted. Reviews the owner marked
 * Ignored no longer count. Unhappy: needs a reply and rated 1 or 2 stars.
 */
export const UNHAPPY_MAX_RATING = 2;

/** The inbox's Needs response status; pair it with `.is("responded_at", null)` in queries. */
export const NEEDS_REPLY_STATUS = "pending";

type ReviewLike = { rating?: number | string | null; response_status?: string | null; responded_at?: string | null };

export function needsReply(review: ReviewLike): boolean {
    return review.response_status === NEEDS_REPLY_STATUS && !review.responded_at;
}

export function isUnhappyUnanswered(review: ReviewLike): boolean {
    const rating = Number(review.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > UNHAPPY_MAX_RATING) return false;
    return needsReply(review);
}
