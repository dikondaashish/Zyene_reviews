"use client";

import dynamic from "next/dynamic";

export const AnalyticsRatingsChart = dynamic(
    () => import("@/components/analytics/ratings-chart").then((m) => m.RatingsChart),
    { ssr: false }
);
export const AnalyticsVolumeChart = dynamic(
    () => import("@/components/analytics/volume-chart").then((m) => m.VolumeChart),
    { ssr: false }
);
export const AnalyticsSentimentChart = dynamic(
    () => import("@/components/analytics/sentiment-chart").then((m) => m.SentimentChart),
    { ssr: false }
);
export const AnalyticsThemeChart = dynamic(
    () => import("@/components/analytics/theme-chart").then((m) => m.ThemeChart),
    { ssr: false }
);
export const AnalyticsPlatformTable = dynamic(
    () => import("@/components/analytics/platform-table").then((m) => m.PlatformTable),
    { ssr: false }
);
export const AnalyticsGooglePerformanceProfileChart = dynamic(
    () =>
        import("@/components/analytics/google-performance-profile-chart").then(
            (m) => m.GooglePerformanceProfileChart
        ),
    { ssr: false }
);
export const AnalyticsReportGenerator = dynamic(
    () => import("@/components/analytics/report-generator").then((m) => m.ReportGenerator),
    { ssr: false }
);
export const AnalyticsEngagementFunnelCard = dynamic(
    () => import("@/components/analytics/engagement-funnel-card").then((m) => m.EngagementFunnelCard),
    { ssr: false }
);
export const AnalyticsZyenePlatformAnalytics = dynamic(
    () => import("@/components/analytics/zyene-platform-analytics").then((m) => m.ZyenePlatformAnalytics),
    { ssr: false }
);
