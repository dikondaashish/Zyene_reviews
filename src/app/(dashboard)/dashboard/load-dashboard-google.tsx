import {
    dateRangeLastNDays,
    getGooglePerformanceTotals,
    type GooglePerformanceTotals,
} from "@/services/google/performance-queries";
import type { ReactElement } from "react";
import { loadDashboardGoogleHealth } from "./load-dashboard-google-health";
import type { DashboardGoogleMetrics, LoadDashboardGoogleInput } from "./load-dashboard-google-types";

export type { DashboardGoogleMetrics, LoadDashboardGoogleInput } from "./load-dashboard-google-types";
export { formatTrend } from "./load-dashboard-google-format";
export { buildDashboardPageDataResult } from "./load-dashboard-google-build";

export async function loadDashboardGoogle(
    input: LoadDashboardGoogleInput,
): Promise<{ errorElement: ReactElement } | { google: DashboardGoogleMetrics }> {
    const { auth, stats, visibleReviewRollup, dict } = input;
    const { supabase, business, googlePlatform, isGoogleConnected, useDemoData, showUnansweredQaCard } =
        auth;

    const health = await loadDashboardGoogleHealth(auth);
    if (health.errorElement) {
        return { errorElement: health.errorElement };
    }

    const { unansweredQaCount, brokenPlaceLinksCount } = health;
    let googlePerf: GooglePerformanceTotals | null = null;

    if (useDemoData) {
        googlePerf = {
            profileViews: 3421,
            callClicks: 89,
            directionRequests: 156,
            websiteClicks: 234,
            rawRowCount: 120,
        };
    } else if (business.id && isGoogleConnected) {
        const { start, end } = dateRangeLastNDays(365);
        googlePerf = await getGooglePerformanceTotals(supabase, business.id, start, end);
    }

    let googleLodgingHealthScore: number | null = null;
    let googleLodgingApplicable: boolean | null = null;
    if (useDemoData) {
        googleLodgingHealthScore = 68;
        googleLodgingApplicable = true;
    } else if (isGoogleConnected) {
        const gp = googlePlatform as {
            google_lodging_health_score?: number | null;
            google_lodging_available?: boolean | null;
        };
        googleLodgingApplicable =
            typeof gp.google_lodging_available === "boolean" ? gp.google_lodging_available : null;
        googleLodgingHealthScore =
            typeof gp.google_lodging_health_score === "number"
                ? gp.google_lodging_health_score
                : null;
    }
    const isHotelBusiness = business.category === "hotel";
    const showLodgingCard = useDemoData || isHotelBusiness || googleLodgingApplicable === true;

    const googleHealthMetricsCount =
        (showUnansweredQaCard ? 1 : 0) + 2 + (showLodgingCard ? 1 : 0);
    const googleHealthMetricsGridClass =
        googleHealthMetricsCount >= 4
            ? "xl:grid-cols-4"
            : googleHealthMetricsCount === 3
              ? "xl:grid-cols-3"
              : "xl:grid-cols-2";

    let googleProfileHealthScore: number | null = null;
    if (useDemoData) {
        googleProfileHealthScore = 72;
    } else if (isGoogleConnected) {
        const gh = (googlePlatform as { google_profile_health_score?: number | null })
            ?.google_profile_health_score;
        googleProfileHealthScore = typeof gh === "number" ? gh : null;
    }

    const displayTotalReviews = visibleReviewRollup?.totalVisible ?? 0;
    const displayAverageRating = visibleReviewRollup?.averageRatingVisible ?? 0;
    const currentReviewsCount = displayTotalReviews;
    const responseRateLabel =
        currentReviewsCount > 0
            ? `${stats.responseRate.toFixed(1)}${dict.dashboard.reviews_responded}`
            : dict.dashboard.no_reviews;

    const pendingLabel =
        stats.pendingCount > 0
            ? `${stats.pendingCount} ${dict.dashboard.awaiting_response}`
            : dict.dashboard.all_caught_up;
    void pendingLabel;

    return {
        google: {
            unansweredQaCount,
            brokenPlaceLinksCount,
            googlePerf,
            googleProfileHealthScore,
            googleLodgingHealthScore,
            googleLodgingApplicable,
            showLodgingCard,
            googleHealthMetricsGridClass,
            displayTotalReviews,
            displayAverageRating,
            responseRateLabel,
        },
    };
}
