"use client";

import { useEffect, useState } from "react";

import { computeZyenePlatformAnalyticsAggregates } from "@/components/analytics/zyene-platform-analytics-compute-aggregates";
import { computeZyenePlatformAnalyticsBase } from "@/components/analytics/zyene-platform-analytics-compute-base";
import type { ZyenePlatformAnalyticsProps } from "@/components/analytics/zyene-platform-analytics-types";
import { ZyenePlatformChannelPerformanceCard } from "@/components/analytics/zyene-platform-channel-performance-card";
import { ZyenePlatformDailyActivityCard } from "@/components/analytics/zyene-platform-daily-activity-card";
import { ZyenePlatformKeyMetricsRow } from "@/components/analytics/zyene-platform-key-metrics-row";
import { ZyenePlatformLowRatingAlertsCard } from "@/components/analytics/zyene-platform-low-rating-alerts-card";
import { ZyenePlatformPopularTagsCard } from "@/components/analytics/zyene-platform-popular-tags-card";
import { ZyenePlatformPrivateFeedbackCard } from "@/components/analytics/zyene-platform-private-feedback-card";
import { ZyenePlatformRatingDistributionCard } from "@/components/analytics/zyene-platform-rating-distribution-card";
import { ZyenePlatformReviewRequestFunnelCard } from "@/components/analytics/zyene-platform-review-request-funnel-card";

export function ZyenePlatformAnalytics({
    requests,
    previousRequests,
    privateFeedback,
    dateRange,
}: ZyenePlatformAnalyticsProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const base = computeZyenePlatformAnalyticsBase(requests, previousRequests);
    const aggregates = computeZyenePlatformAnalyticsAggregates(base);

    if (!mounted) return <div className="h-[600px] w-full" />;

    return (
        <div className="flex flex-col gap-8 w-full">
            <ZyenePlatformReviewRequestFunnelCard
                dateRange={dateRange}
                funnelSteps={aggregates.funnelSteps}
                totalSent={base.totalSent}
            />

            <ZyenePlatformKeyMetricsRow
                allSourceClicked={base.allSourceClicked}
                prevAllSourceClicked={base.prevAllSourceClicked}
                allSourceClickRate={base.allSourceClickRate}
                totalSent={base.totalSent}
                allSourcePostedToGoogle={base.allSourcePostedToGoogle}
                allSourceConversionRate={base.allSourceConversionRate}
                prevAllSourcePostedToGoogle={base.prevAllSourcePostedToGoogle}
                allSourceAvgRating={base.allSourceAvgRating}
                prevAllSourceAvgRating={base.prevAllSourceAvgRating}
                allSourceRatingsGivenLength={base.allSourceRatingsGiven.length}
                allSourceLowRatingsLength={base.allSourceLowRatings.length}
                prevAllSourceLowRatingsLength={base.prevAllSourceLowRatings.length}
            />

            <div className="grid gap-6 lg:grid-cols-5">
                <ZyenePlatformDailyActivityCard dailyData={aggregates.dailyData} />
                <ZyenePlatformChannelPerformanceCard channelData={aggregates.channelData} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <ZyenePlatformRatingDistributionCard
                    ratingDist={aggregates.ratingDist}
                    maxRatingCount={aggregates.maxRatingCount}
                    ratingColors={aggregates.ratingColors}
                    allSourceRatingsGivenLength={base.allSourceRatingsGiven.length}
                />
                <ZyenePlatformPopularTagsCard
                    popularTags={aggregates.popularTags}
                    maxTagCount={aggregates.maxTagCount}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <ZyenePlatformLowRatingAlertsCard
                    lowRatingEntries={aggregates.lowRatingEntries}
                    lowRatingsLength={base.lowRatings.length}
                />
                <ZyenePlatformPrivateFeedbackCard privateFeedback={privateFeedback} />
            </div>
        </div>
    );
}
