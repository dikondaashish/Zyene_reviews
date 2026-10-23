import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { VisibleReviewRollup } from "@/lib/reviews/visible-review-rollups";
import type { DashboardAuthContext } from "./load-dashboard-auth";
import type { DashboardStatsState } from "./load-dashboard-stats-state";

export type DashboardGoogleMetrics = {
    brokenPlaceLinksCount: number;
    displayTotalReviews: number;
    displayAverageRating: number;
};

export type LoadDashboardGoogleInput = {
    auth: DashboardAuthContext;
    stats: DashboardStatsState;
    visibleReviewRollup: VisibleReviewRollup | null;
    dict: Dictionary;
};
