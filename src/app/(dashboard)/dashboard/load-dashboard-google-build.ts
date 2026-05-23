import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { LoadDashboardPageDataResult } from "./types";
import type { DashboardAuthContext } from "./load-dashboard-auth";
import type { DashboardGoogleMetrics } from "./load-dashboard-google-types";
import type { DashboardStatsState } from "./load-dashboard-stats-state";

export function buildDashboardPageDataResult(
    auth: DashboardAuthContext,
    stats: DashboardStatsState,
    google: DashboardGoogleMetrics,
    dict: Dictionary,
): LoadDashboardPageDataResult {
    return {
        data: {
            user: auth.user,
            dict,
            business: auth.business,
            organization: auth.organization,
            useDemoData: auth.useDemoData,
            isGoogleConnected: auth.isGoogleConnected,
            customerCount: stats.customerCount,
            notificationsConfigured: stats.notificationsConfigured,
            requestsThisMonth: stats.requestsThisMonth,
            displayTotalReviews: google.displayTotalReviews,
            displayAverageRating: google.displayAverageRating,
            responseRate: stats.responseRate,
            pendingCount: stats.pendingCount,
            totalReviewsTrend: stats.totalReviewsTrend,
            averageRatingTrend: stats.averageRatingTrend,
            responseRateLabel: google.responseRateLabel,
            showUnansweredQaCard: auth.showUnansweredQaCard,
            unansweredQaCount: google.unansweredQaCount,
            brokenPlaceLinksCount: google.brokenPlaceLinksCount,
            googleProfileHealthScore: google.googleProfileHealthScore,
            showLodgingCard: google.showLodgingCard,
            googleLodgingHealthScore: google.googleLodgingHealthScore,
            googleLodgingApplicable: google.googleLodgingApplicable,
            googleHealthMetricsGridClass: google.googleHealthMetricsGridClass,
            googlePerf: google.googlePerf,
            positivePercent: stats.positivePercent,
            negativePercent: stats.negativePercent,
            hasSentimentData: stats.hasSentimentData,
            engagementRate: stats.engagementRate,
            hasEngagementData: stats.hasEngagementData,
            maxRequestsPerMonth: auth.maxRequestsPerMonth,
            isPaidPlan: auth.isPaidPlan,
            newReviews30d: stats.newReviews30d,
            trendData: stats.trendData,
            ratingData: stats.ratingData,
            recentReviews: stats.recentReviews,
            attentionReviews: stats.attentionReviews,
            planAllowsAiReplies: auth.planAllowsAiReplies,
        },
    };
}
