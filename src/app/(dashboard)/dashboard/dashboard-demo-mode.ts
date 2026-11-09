import type { VisibleReviewRollup } from "@/lib/reviews/visible-review-rollups";

type DashboardDemoModeInput = {
    businessId: string;
    /** Every review platform row the business has, in any sync state. */
    reviewPlatforms: ReadonlyArray<{ platform?: string | null }> | null | undefined;
    /** Cached aggregate on the business row. */
    totalReviews: number | null | undefined;
    visibleReviewRollup: VisibleReviewRollup | null;
};

/**
 * Sample numbers are only for a brand-new business with nothing to show yet: no review
 * platform of any kind (Google in any state, Yelp, Facebook) and no stored reviews.
 * Anyone with a platform or a single review sees their own data; a Google connection that
 * needs reconnecting is surfaced by the layout's GoogleConnectBanner, not by hiding real data.
 */
export function shouldUseDashboardDemoData(input: DashboardDemoModeInput): boolean {
    if (!input.businessId) return true;
    if ((input.reviewPlatforms?.length ?? 0) > 0) return false;
    if ((input.totalReviews ?? 0) > 0) return false;
    if ((input.visibleReviewRollup?.totalReviewRows ?? 0) > 0) return false;
    return true;
}
