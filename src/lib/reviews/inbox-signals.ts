/**
 * Signals that help an owner pick which review to answer first, shown on the collapsed
 * inbox row. Only unanswered reviews get them: once replied to, nothing is waiting.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
/** Older than this, the date on the row already says enough; a big "waiting" number just nags. */
const MAX_WAIT_DAYS = 30;
/** Same rule as the dashboard's "Needs attention": low stars or an AI urgency of 7+. */
const URGENT_MAX_RATING = 2;
const URGENT_MIN_SCORE = 7;

export function isUnanswered(status: unknown): boolean {
    return status === undefined || status === null || status === "" || status === "pending";
}

/** An unanswered review that can hurt the business: 1–2 stars, or flagged urgent by the AI. */
export function isUrgentReview(review: { rating?: unknown; urgency_score?: unknown; response_status?: unknown }): boolean {
    if (!isUnanswered(review.response_status)) return false;
    const rating = typeof review.rating === "number" ? review.rating : null;
    const urgency = typeof review.urgency_score === "number" ? review.urgency_score : null;
    return (rating !== null && rating >= 1 && rating <= URGENT_MAX_RATING) || (urgency !== null && urgency >= URGENT_MIN_SCORE);
}

/**
 * "Waiting 3 days" for an unanswered review posted 1–30 days ago; null otherwise
 * (answered, posted today, in the future, an unreadable date, or older than 30 days).
 */
export function replyWaitLabel(reviewDate: unknown, status: unknown, now: Date): string | null {
    if (!isUnanswered(status) || typeof reviewDate !== "string") return null;
    const posted = new Date(reviewDate).getTime();
    if (Number.isNaN(posted)) return null;
    const days = Math.floor((now.getTime() - posted) / DAY_MS);
    if (days < 1 || days > MAX_WAIT_DAYS) return null;
    return `Waiting ${days} ${days === 1 ? "day" : "days"}`;
}
