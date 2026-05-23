"use client";

import type { AnalyticsFullRangePayload } from "@/lib/analytics/build-analytics-range-payload";
import { AnalyticsPageStatsRow } from "@/components/analytics/analytics-page-stats-row";
import { AnalyticsPageRatingSentimentRow } from "@/components/analytics/analytics-page-rating-sentiment-row";
import { AnalyticsPageVolumeThemesRow } from "@/components/analytics/analytics-page-volume-themes-row";
import { AnalyticsPageGooglePerformanceSection } from "@/components/analytics/analytics-page-google-performance-section";
import { AnalyticsPageGoogleKeywordsDiscovery } from "@/components/analytics/analytics-page-google-keywords-discovery";
import { AnalyticsPagePlatformCompare } from "@/components/analytics/analytics-page-platform-compare";

export function AnalyticsPageDefaultStack({
    d,
    isDemo,
    platform,
    isGoogleConnected,
    perfTotals,
}: {
    d: AnalyticsFullRangePayload;
    isDemo: boolean;
    platform: string;
    isGoogleConnected: boolean;
    perfTotals: {
        profileViews?: number;
        websiteClicks?: number;
        callClicks?: number;
        directionRequests?: number;
    } | null;
}) {
    const searchKeywords = d.searchKeywords ?? [];

    return (
        <>
            <AnalyticsPageStatsRow d={d} isDemo={isDemo} />
            <AnalyticsPageRatingSentimentRow d={d} isDemo={isDemo} />
            <AnalyticsPageVolumeThemesRow d={d} />

            {(platform === "all" || platform === "google") && isGoogleConnected && (
                <div className="space-y-6">
                    <AnalyticsPageGooglePerformanceSection d={d} perfTotals={perfTotals} />
                    <AnalyticsPageGoogleKeywordsDiscovery d={d} searchKeywords={searchKeywords} />
                </div>
            )}

            {platform === "all" && <AnalyticsPagePlatformCompare d={d} />}
        </>
    );
}
