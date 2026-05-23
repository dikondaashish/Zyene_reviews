import type { RawReviewRow } from "./types";

export function createEmptyDashboardStatsState() {
    return {
        responseRate: 0,
        pendingCount: 0,
        recentReviews: [] as RawReviewRow[],
        attentionReviews: [] as RawReviewRow[],
        trendData: [] as { day: string; count: number }[],
        ratingData: [] as { rating: number; count: number }[],
        totalReviewsTrend: 0,
        averageRatingTrend: 0,
        positivePercent: 0,
        negativePercent: 0,
        hasSentimentData: false,
        engagementRate: 0,
        hasEngagementData: false,
        requestsThisMonth: 0,
        newReviews30d: 0,
        customerCount: 0,
        notificationsConfigured: false,
    };
}

export type DashboardStatsState = ReturnType<typeof createEmptyDashboardStatsState>;
