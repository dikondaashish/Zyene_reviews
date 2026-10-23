import type { ReactElement } from "react";
import { loadDashboardGoogleHealth } from "./load-dashboard-google-health";
import type { DashboardGoogleMetrics, LoadDashboardGoogleInput } from "./load-dashboard-google-types";

export type { DashboardGoogleMetrics, LoadDashboardGoogleInput } from "./load-dashboard-google-types";
export { buildDashboardPageDataResult } from "./load-dashboard-google-build";

/**
 * Only what the dashboard still shows. Google listing performance and profile health live on
 * Analytics and Google SEO/AEO, so the dashboard no longer pays for those queries.
 */
export async function loadDashboardGoogle(
    input: LoadDashboardGoogleInput,
): Promise<{ errorElement: ReactElement } | { google: DashboardGoogleMetrics }> {
    const { auth, visibleReviewRollup } = input;

    const health = await loadDashboardGoogleHealth(auth);
    if (health.errorElement) {
        return { errorElement: health.errorElement };
    }

    return {
        google: {
            brokenPlaceLinksCount: health.brokenPlaceLinksCount,
            displayTotalReviews: visibleReviewRollup?.totalVisible ?? 0,
            displayAverageRating: visibleReviewRollup?.averageRatingVisible ?? 0,
        },
    };
}
