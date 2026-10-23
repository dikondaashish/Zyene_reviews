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
            brokenPlaceLinksCount: google.brokenPlaceLinksCount,
            hasEngagementData: stats.hasEngagementData,
            maxRequestsPerMonth: auth.maxRequestsPerMonth,
            isPaidPlan: auth.isPaidPlan,
            newReviews30d: stats.newReviews30d,
            recentReviews: stats.recentReviews,
            attentionReviews: stats.attentionReviews,
            unhappyUnansweredCount: stats.unhappyUnansweredCount,
            planAllowsAiReplies: auth.planAllowsAiReplies,
        },
    };
}
