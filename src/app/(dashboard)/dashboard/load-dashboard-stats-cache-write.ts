import { logger } from "@/lib/logger";
import type { DashboardCachedStats } from "./types";
import type { DashboardStatsState } from "./load-dashboard-stats-state";

export async function cacheDashboardStats(
    businessId: string,
    stats: DashboardStatsState,
): Promise<void> {
    const statsToCache: DashboardCachedStats = {
        responseRate: stats.responseRate,
        pendingCount: stats.pendingCount,
        recentReviews: stats.recentReviews,
        attentionReviews: stats.attentionReviews,
        trendData: stats.trendData,
        ratingData: stats.ratingData,
        totalReviewsTrend: stats.totalReviewsTrend,
        averageRatingTrend: stats.averageRatingTrend,
        positivePercent: stats.positivePercent,
        negativePercent: stats.negativePercent,
        hasSentimentData: stats.hasSentimentData,
        engagementRate: stats.engagementRate,
        hasEngagementData: stats.hasEngagementData,
        requestsThisMonth: stats.requestsThisMonth,
        newReviews30d: stats.newReviews30d,
    };
    try {
        const { redis } = await import("@/lib/db/redis");
        await redis.set(
            `dashboard:stats:v2:${businessId}`,
            JSON.stringify(statsToCache),
            {
                ex: 300,
            },
        );
    } catch (e) {
        logger.error({ err: e }, "Redis set error:");
    }
}
