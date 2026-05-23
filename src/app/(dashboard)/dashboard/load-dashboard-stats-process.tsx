import { logger } from "@/lib/logger";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import type { ReactElement } from "react";
import { computeYtdReviewTrends } from "./helpers";
import type { RawReviewRow } from "./types";
import type { DashboardAuthContext } from "./load-dashboard-auth";
import type { DashboardStatsState } from "./load-dashboard-stats-state";
import type { DashboardStatsQueryResults } from "./load-dashboard-stats-queries";
import {
    applyDashboardRatingDistribution,
    applyDashboardTrendChart,
} from "./load-dashboard-stats-process-charts";

export function processDashboardStatsQueryResults(
    auth: DashboardAuthContext,
    stats: DashboardStatsState,
    results: DashboardStatsQueryResults,
): { stats: DashboardStatsState; errorElement?: ReactElement } {
    const { visibleReviewRollup } = auth;
    const [
        respondedResult,
        pendingResult,
        recentResult,
        attentionResult,
        monthResult,
        trendResult,
        ratingResult,
        positiveResult,
        negMixedResult,
        sentimentTotalResult,
        completedRequestsResult,
        sentRequestsResult,
        monthlyRequestsResult,
        newReview30dResult,
        customerCountResult,
        notificationPrefsResult,
    ] = results;

    const coreFetchError =
        respondedResult.error ||
        pendingResult.error ||
        recentResult.error ||
        attentionResult.error ||
        monthResult.error ||
        trendResult.error ||
        ratingResult.error ||
        positiveResult.error ||
        negMixedResult.error ||
        sentimentTotalResult.error ||
        completedRequestsResult.error ||
        sentRequestsResult.error ||
        monthlyRequestsResult.error ||
        newReview30dResult.error ||
        customerCountResult.error ||
        notificationPrefsResult.error;
    if (coreFetchError) {
        logger.error({ err: coreFetchError }, "[Dashboard page] Core fetch failed:");
        return {
            stats,
            errorElement: (
                <DashboardFetchError
                    message="We could not load dashboard stats for this business. Check your connection and try again."
                    retryHref="/dashboard"
                />
            ),
        };
    }

    const totalVisible = visibleReviewRollup?.totalVisible ?? 0;
    stats.pendingCount = visibleReviewRollup?.pendingVisible ?? 0;
    stats.responseRate =
        totalVisible > 0 ? ((respondedResult.count || 0) / totalVisible) * 100 : 0;

    stats.recentReviews = (recentResult.data || []) as RawReviewRow[];
    stats.attentionReviews = (attentionResult.data || []) as RawReviewRow[];

    const now = new Date();
    const monthData = (monthResult.data || []) as Array<{ review_date: string; rating: number }>;
    if (monthData.length > 0) {
        const ytd = computeYtdReviewTrends(monthData, now);
        stats.totalReviewsTrend = ytd.totalPct;
        stats.averageRatingTrend = ytd.ratingDelta;
    }

    applyDashboardTrendChart(stats, (trendResult.data || []) as Array<{ review_date: string }>);
    applyDashboardRatingDistribution(stats, (ratingResult.data || []) as Array<{ rating: number }>);

    const totalSentiment = sentimentTotalResult.count || 0;
    if (totalSentiment > 0) {
        stats.hasSentimentData = true;
        stats.positivePercent = ((positiveResult.count || 0) / totalSentiment) * 100;
        stats.negativePercent = ((negMixedResult.count || 0) / totalSentiment) * 100;
    }

    if ((sentRequestsResult.count || 0) > 0) {
        stats.hasEngagementData = true;
        stats.engagementRate =
            ((completedRequestsResult.count || 0) / (sentRequestsResult.count || 1)) * 100;
    }

    stats.requestsThisMonth = monthlyRequestsResult.count || 0;
    stats.newReviews30d = newReview30dResult.count || 0;
    stats.customerCount = customerCountResult.count || 0;
    stats.notificationsConfigured =
        (notificationPrefsResult.data &&
            notificationPrefsResult.data.length > 0 &&
            (notificationPrefsResult.data[0].email_enabled ||
                notificationPrefsResult.data[0].sms_enabled)) ||
        false;

    return { stats };
}
