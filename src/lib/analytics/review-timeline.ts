/**
 * Analytics should follow when the review was written (platform review date),
 * not when the row was inserted — bulk Google syncs set `created_at` to sync time.
 */

export type ReviewTimelineFields = {
    review_date?: string | null;
    created_at?: string | null;
};

export function effectiveReviewAt(r: ReviewTimelineFields): Date {
    const raw = r.review_date || r.created_at;
    return new Date(raw || 0);
}

/** Display sentiment when AI field is missing: infer from star rating. */
export function displaySentimentLabel(r: {
    sentiment?: string | null;
    rating?: number | null;
}): "positive" | "negative" | "neutral" | "mixed" {
    const s = (r.sentiment || "").toLowerCase().trim();
    if (s === "positive" || s === "negative" || s === "mixed" || s === "neutral") {
        return s;
    }
    const rating = Number(r.rating ?? 0);
    if (rating >= 4) return "positive";
    if (rating <= 2 && rating > 0) return "negative";
    return "neutral";
}
