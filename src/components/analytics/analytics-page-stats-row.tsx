"use client";

import { StatsCard } from "@/components/analytics/stats-card";
import type { AnalyticsFullRangePayload } from "@/lib/analytics/build-analytics-range-payload";

export function AnalyticsPageStatsRow({ d, isDemo }: { d: AnalyticsFullRangePayload; isDemo: boolean }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
                title="New Reviews"
                value={d.stats.totalReviews}
                description="Reviews whose review date falls in this period"
                trend={
                    d.stats.reviewsDelta === null ? undefined : { value: d.stats.reviewsDelta, label: "vs last period" }
                }
                isDemo={isDemo}
            />
            <StatsCard
                title="Average Rating"
                value={d.stats.avgRating.toFixed(1)}
                description={`Based on ${d.stats.totalReviews} reviews (same date window)`}
                trend={
                    d.stats.ratingDelta === null ? undefined : { value: d.stats.ratingDelta, label: "vs last period" }
                }
                isDemo={isDemo}
            />
            <StatsCard
                title="Response Rate"
                value={`${d.stats.responseRate.toFixed(0)}%`}
                description={`${d.stats.respondedCount} responded`}
                trend={
                    d.stats.responseRateDelta === null
                        ? undefined
                        : { value: d.stats.responseRateDelta, label: "vs last period" }
                }
                isDemo={isDemo}
            />
            <StatsCard
                title="Requests Sent"
                value={d.stats.requestsCount}
                description="Review invitations"
                trend={
                    d.stats.requestsDelta === null ? undefined : { value: d.stats.requestsDelta, label: "vs last period" }
                }
                isDemo={isDemo}
            />
        </div>
    );
}
