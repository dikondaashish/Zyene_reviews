import { PLAN_MAP } from "@/services/stripe/plan-catalog";
import { calculateRequestMetrics } from "@/lib/metrics/business-metrics";
import { calculatePublicLinkMetrics, type PublicLinkMetricRow } from "@/lib/metrics/public-link-metrics";

/**
 * "Is Zyene worth what I pay?" One month of results, in plain numbers the owner can check.
 * Only counts work Zyene did; money figures are labelled estimates with stated assumptions.
 */

/** Minutes an owner would spend writing one review reply by hand. */
export const MINUTES_PER_REPLY = 5;
/** Minutes to ask one customer for a review by text or email by hand. */
export const MINUTES_PER_REQUEST = 3;
/** Hourly value used to turn saved time into dollars. Shown to the owner next to the figure. */
export const HOURLY_RATE_USD = 25;

export type ValueSummaryInput = {
    /** This month's review_requests rows (sent requests and public link visits). */
    requests: PublicLinkMetricRow[];
    newReviews: number;
    newReviewsLastMonth: number;
    /** Replies posted through Zyene this month (by hand in Zyene or by the auto replier). */
    zyeneReplies: number;
    privateFeedback: number;
    plan: string | null | undefined;
    planStatus: string | null | undefined;
    /** What Stripe actually charges per month; undefined falls back to the plan's list price. */
    monthlyCharge?: number;
};

const UNHAPPY_STATUSES = new Set(["feedback_left", "rated_negative"]);

/** Monthly price for a paid plan, or null when the business pays nothing we can show. */
export function monthlyPlanPrice(plan: string | null | undefined, planStatus?: string | null): number | null {
    if (!plan || planStatus === "canceled") return null;
    const entry = PLAN_MAP[plan];
    if (!entry?.price) return null;
    return entry.interval === "year" ? entry.price / 12 : entry.price;
}

export function calculateValueSummary(input: ValueSummaryInput) {
    const sent = calculateRequestMetrics(input.requests);
    const link = calculatePublicLinkMetrics(input.requests);
    const sentToGoogle = input.requests.filter((r) => r.status === "completed").length;
    const caughtFromRequests = input.requests.filter(
        (r) =>
            (r.status && UNHAPPY_STATUSES.has(r.status)) ||
            (r.rating_given !== null && r.rating_given !== undefined && r.rating_given <= 3),
    ).length;
    // Private feedback can arrive without a tracked request, so take whichever saw more.
    const unhappyCaught = Math.max(caughtFromRequests, input.privateFeedback);

    const minutesSaved = input.zyeneReplies * MINUTES_PER_REPLY + sent.totalSent * MINUTES_PER_REQUEST;
    const hoursSaved = minutesSaved / 60;
    const price =
        input.planStatus === "canceled"
            ? null
            : input.monthlyCharge ?? monthlyPlanPrice(input.plan, input.planStatus);

    return {
        sentToGoogle,
        requestsSent: sent.totalSent,
        linkVisits: link.visits,
        newReviews: input.newReviews,
        newReviewsChange: input.newReviews - input.newReviewsLastMonth,
        unhappyCaught,
        zyeneReplies: input.zyeneReplies,
        hoursSaved,
        timeValueUsd: hoursSaved * HOURLY_RATE_USD,
        monthlyPrice: price,
        costPerGoogleCustomer: price && sentToGoogle > 0 ? price / sentToGoogle : null,
        hasActivity:
            sentToGoogle + sent.totalSent + link.visits + input.newReviews + unhappyCaught + input.zyeneReplies > 0,
    };
}

export type ValueSummary = ReturnType<typeof calculateValueSummary>;
