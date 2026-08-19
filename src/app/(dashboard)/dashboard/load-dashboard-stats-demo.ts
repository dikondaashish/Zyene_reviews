import { DASHBOARD_DEMO_DATA } from "@/constants/dashboard-demo-data";
import type { VisibleReviewRollup } from "@/lib/reviews/visible-review-rollups";
import type { BusinessExtended } from "./types";
import type { DashboardStatsState } from "./load-dashboard-stats-state";

export function applyDashboardStatsDemo(
    stats: DashboardStatsState,
    business: BusinessExtended,
): { stats: DashboardStatsState; visibleReviewRollup: VisibleReviewRollup } {
    stats.responseRate = DASHBOARD_DEMO_DATA.responseRate;
    stats.pendingCount = DASHBOARD_DEMO_DATA.pendingCount;
    stats.recentReviews = [...DASHBOARD_DEMO_DATA.recentReviews];
    stats.trendData = [...DASHBOARD_DEMO_DATA.trendData];
    stats.ratingData = [...DASHBOARD_DEMO_DATA.ratingData];
    stats.positivePercent = DASHBOARD_DEMO_DATA.positivePercent;
    stats.negativePercent = DASHBOARD_DEMO_DATA.negativePercent;
    stats.hasSentimentData = true;
    stats.engagementRate = DASHBOARD_DEMO_DATA.engagementRate;
    stats.hasEngagementData = true;
    stats.newReviews30d = DASHBOARD_DEMO_DATA.newReviews30d;
    stats.attentionReviews = [...DASHBOARD_DEMO_DATA.attentionReviews];
    stats.totalReviewsTrend = 12;
    stats.averageRatingTrend = 0.1;

    business.total_reviews = DASHBOARD_DEMO_DATA.total_reviews;
    business.average_rating = DASHBOARD_DEMO_DATA.average_rating;

    const visibleReviewRollup: VisibleReviewRollup = {
        totalReviewRows: DASHBOARD_DEMO_DATA.total_reviews,
        totalVisible: DASHBOARD_DEMO_DATA.total_reviews,
        respondedVisible:
            DASHBOARD_DEMO_DATA.total_reviews -
            DASHBOARD_DEMO_DATA.pendingCount,
        pendingVisible: DASHBOARD_DEMO_DATA.pendingCount,
        responseRateVisible: DASHBOARD_DEMO_DATA.responseRate,
        averageRatingVisible: DASHBOARD_DEMO_DATA.average_rating,
        positiveVisible: Math.round(
            (DASHBOARD_DEMO_DATA.positivePercent / 100) *
                DASHBOARD_DEMO_DATA.total_reviews,
        ),
        neutralVisible: 0,
        negativeVisible: Math.round(
            (DASHBOARD_DEMO_DATA.negativePercent / 100) *
                DASHBOARD_DEMO_DATA.total_reviews,
        ),
        positiveRateVisible: DASHBOARD_DEMO_DATA.positivePercent,
        negativeRateVisible: DASHBOARD_DEMO_DATA.negativePercent,
        googleRowCount: DASHBOARD_DEMO_DATA.total_reviews,
        googleVisibleCount: DASHBOARD_DEMO_DATA.total_reviews,
        googleAverageRating: DASHBOARD_DEMO_DATA.average_rating,
        facebookRowCount: 0,
        facebookVisibleCount: 0,
        facebookAverageRating: 0,
        yelpRowCount: 0,
        yelpVisibleCount: 0,
        yelpAverageRating: 0,
    };

    return { stats, visibleReviewRollup };
}
