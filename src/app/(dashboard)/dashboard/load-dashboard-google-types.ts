import type { GooglePerformanceTotals } from "@/services/google/performance-queries";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { VisibleReviewRollup } from "@/lib/reviews/visible-review-rollups";
import type { DashboardAuthContext } from "./load-dashboard-auth";
import type { DashboardStatsState } from "./load-dashboard-stats-state";

export type DashboardGoogleMetrics = {
    unansweredQaCount: number;
    brokenPlaceLinksCount: number;
    googlePerf: GooglePerformanceTotals | null;
    googleProfileHealthScore: number | null;
    googleLodgingHealthScore: number | null;
    googleLodgingApplicable: boolean | null;
    showLodgingCard: boolean;
    googleHealthMetricsGridClass: string;
    displayTotalReviews: number;
    displayAverageRating: number;
    responseRateLabel: string;
};

export type LoadDashboardGoogleInput = {
    auth: DashboardAuthContext;
    stats: DashboardStatsState;
    visibleReviewRollup: VisibleReviewRollup | null;
    dict: Dictionary;
};
