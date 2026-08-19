import type { RequestMetrics, ReviewMetrics } from "@/lib/metrics/business-metrics";

export function buildAnalyticsApiData(
    rangeDays: number,
    reviews: ReviewMetrics,
    requests: RequestMetrics,
    reviewLeft: number,
) {
    return {
        rangeDays,
        reviews: {
            total: reviews.totalReviews,
            avgRating: Number(reviews.averageRating.toFixed(2)),
            responded: reviews.respondedReviews,
            pending: reviews.pendingReviews,
            responseRate: Number(reviews.responseRate.toFixed(1)),
            positiveRate: Number(reviews.positiveRate.toFixed(1)),
        },
        requests: {
            total: requests.totalSent,
            sent: requests.totalSent,
            delivered: requests.delivered,
            clicked: requests.clicked,
            completed: requests.completed,
            reviewLeft,
            deliveryRate: Number(requests.deliveryRate.toFixed(1)),
            clickRate: Number(requests.clickRate.toFixed(1)),
            completionRate: Number(requests.conversionRate.toFixed(1)),
        },
    };
}
