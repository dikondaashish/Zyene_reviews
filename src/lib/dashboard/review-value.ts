/**
 * "What are my new reviews worth?" A deliberately simple, stated estimate: each new review is
 * counted as one new customer at the owner's average sale. Owners can set their own average
 * sale; until they do, a typical figure for their business category is used and labelled so.
 */

/** Typical spend per customer visit, in dollars, by business category (see BUSINESS_TYPES). */
export const DEFAULT_AVERAGE_SALE_USD: Record<string, number> = {
    restaurant: 35,
    coffee: 12,
    salon: 70,
    dental: 250,
    gym: 60,
    spa: 120,
    hotel: 180,
    retail: 50,
    automotive: 300,
    healthcare: 150,
    home_services: 350,
};

/** Used when the category is "other", unknown or missing. */
export const FALLBACK_AVERAGE_SALE_USD = 75;

/** New customers assumed per new review. Shown to the owner next to the estimate. */
export const CUSTOMERS_PER_REVIEW = 1;

export type AverageSale = { usd: number; source: "owner" | "category" };

export function resolveAverageSale(averageSaleCents: number | null | undefined, category: string | null | undefined): AverageSale {
    if (averageSaleCents && averageSaleCents > 0) return { usd: averageSaleCents / 100, source: "owner" };
    const key = (category ?? "").trim().toLowerCase();
    return { usd: DEFAULT_AVERAGE_SALE_USD[key] ?? FALLBACK_AVERAGE_SALE_USD, source: "category" };
}

/**
 * Estimated new business from this month's reviews, and how many times over that covers the
 * plan. `returnMultiple` is null when there is no price to compare against (free or trial).
 */
export function calculateReviewValue(newReviews: number, averageSale: AverageSale, monthlyPrice: number | null) {
    const valueUsd = Math.max(0, newReviews) * CUSTOMERS_PER_REVIEW * averageSale.usd;
    return {
        valueUsd,
        perReviewUsd: averageSale.usd * CUSTOMERS_PER_REVIEW,
        returnMultiple: monthlyPrice && monthlyPrice > 0 && valueUsd > 0 ? valueUsd / monthlyPrice : null,
    };
}

export type ReviewValue = ReturnType<typeof calculateReviewValue>;
