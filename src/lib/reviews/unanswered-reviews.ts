import { isRespondedReview } from "@/lib/metrics/business-metrics";

/**
 * One meaning of "unanswered" and "unhappy" for every review count the owner sees, so the
 * dashboard's pending total, reply rate, waiting card and attention list always agree.
 *
 * Unanswered: visible, with no reply (`isRespondedReview` is false).
 * Unhappy: unanswered and rated 1 or 2 stars.
 */
export const UNHAPPY_MAX_RATING = 2;

/**
 * PostgREST `.or()` filter for "not replied"; pair it with `.is("responded_at", null)`.
 * Null status counts as unanswered, as in `isRespondedReview`.
 */
export const NOT_RESPONDED_OR_FILTER = "response_status.is.null,response_status.neq.responded";

type ReviewLike = { rating?: number | string | null; response_status?: string | null; responded_at?: string | null };

export function isUnhappyUnanswered(review: ReviewLike): boolean {
    const rating = Number(review.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > UNHAPPY_MAX_RATING) return false;
    return !isRespondedReview({ response_status: review.response_status, responded_at: review.responded_at });
}
