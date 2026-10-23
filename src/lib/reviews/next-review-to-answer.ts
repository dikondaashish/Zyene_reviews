import { isUnanswered } from "@/lib/reviews/inbox-signals";

type InboxReview = { id: string; response_status?: unknown; platform?: unknown };

/** Yelp replies happen on yelp.com, so they can't be the "next" review to answer here. */
function canAnswerHere(review: InboxReview): boolean {
    return isUnanswered(review.response_status) && review.platform !== "yelp";
}

/**
 * After the owner replies to `answeredId`, the next review on this page still waiting for
 * a reply, looking below it first and then wrapping to the top. Null when none is left.
 */
export function nextReviewToAnswer(reviews: InboxReview[], answeredId: string): string | null {
    const at = reviews.findIndex((r) => r.id === answeredId);
    const ordered = at === -1 ? reviews : [...reviews.slice(at + 1), ...reviews.slice(0, at)];
    return ordered.find((r) => r.id !== answeredId && canAnswerHere(r))?.id ?? null;
}
