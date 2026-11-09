/**
 * Rating-aware wording for AI review drafts. A business can send 1-5 star ratings to
 * Google (min_stars_for_google), so a draft must sound like the stars the customer gave:
 * a gushing 3-star review reads as fake and can get the review filtered.
 */

/** Same default the public review page uses when the business has not set a threshold. */
export const DEFAULT_MIN_STARS_FOR_GOOGLE = 4;

export function resolveMinStarsForGoogle(value: number | null | undefined): number {
    return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5
        ? value
        : DEFAULT_MIN_STARS_FOR_GOOGLE;
}

/** Prompt line that keeps the draft's tone consistent with the rating. */
export function ratingToneInstruction(rating: number): string {
    if (rating >= 4) return "";
    if (rating === 3) {
        return " The rating is mixed (3 stars): keep the tone balanced and honest, mention what they liked, avoid superlatives and exclamation marks.";
    }
    return ` The rating is low (${rating} star${rating === 1 ? "" : "s"}): keep the tone calm and measured, mention only what they actually liked, no praise beyond that and no exclamation marks.`;
}

/** Overall-sentiment sentence used when no specific highlights were picked. */
export function overallExperienceSentence(rating: number): string {
    if (rating >= 4) return "They had a positive experience overall.";
    if (rating === 3) return "They had a decent experience overall, with some room to improve.";
    return "Parts of their visit were fine, but overall it fell short.";
}

/**
 * Template used when AI drafting fails, so a customer is never stuck. It must match
 * the rating too: "Great experience... Highly recommend" under 3 stars looks fake.
 */
export function fallbackReviewText(businessName: string, highlights: string[], rating: number): string {
    const liked = highlights.filter(Boolean).slice(0, 2).join(" and ").toLowerCase() || "service";
    if (rating >= 5) return `Had a wonderful time at ${businessName}. The ${liked} was fantastic. Will be back to ${businessName}.`;
    if (rating === 4) return `Good experience at ${businessName}. The ${liked} stood out. Glad I visited ${businessName}.`;
    if (rating === 3) return `A decent visit overall. The ${liked} was good, though a few things could be better at ${businessName}.`;
    return `Mixed visit overall. The ${liked} was fine, but the experience fell short of expectations at ${businessName}.`;
}
