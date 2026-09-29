"use client";

import dynamic from "next/dynamic";
import { PanelLoading } from "@/components/dashboard/panel-loading";

const chartLoading = () => <PanelLoading className="h-[340px]" />;

export const AnalyticsRatingsChart = dynamic(
    () => import("@/components/analytics/ratings-chart").then((m) => m.RatingsChart),
    { ssr: false, loading: chartLoading }
);
export const AnalyticsVolumeChart = dynamic(
    () => import("@/components/analytics/volume-chart").then((m) => m.VolumeChart),
    { ssr: false, loading: chartLoading }
);
export const AnalyticsSentimentChart = dynamic(
    () => import("@/components/analytics/sentiment-chart").then((m) => m.SentimentChart),
    { ssr: false, loading: chartLoading }
);
export const AnalyticsThemeChart = dynamic(
    () => import("@/components/analytics/theme-chart").then((m) => m.ThemeChart),
    { ssr: false, loading: chartLoading }
);
export const AnalyticsPlatformTable = dynamic(
    () => import("@/components/analytics/platform-table").then((m) => m.PlatformTable),
    { ssr: false, loading: chartLoading }
);
export const AnalyticsGooglePerformanceProfileChart = dynamic(
    () =>
        import("@/components/analytics/google-performance-profile-chart").then(
            (m) => m.GooglePerformanceProfileChart
        ),
    { ssr: false, loading: chartLoading }
);
export const AnalyticsReportGenerator = dynamic(
    () => import("@/components/analytics/report-generator").then((m) => m.ReportGenerator),
    { ssr: false }
);
export const AnalyticsEngagementFunnelCard = dynamic(
    () => import("@/components/analytics/engagement-funnel-card").then((m) => m.EngagementFunnelCard),
    { ssr: false, loading: chartLoading }
);
export const AnalyticsZyenePlatformAnalytics = dynamic(
    () => import("@/components/analytics/zyene-platform-analytics").then((m) => m.ZyenePlatformAnalytics),
    { ssr: false, loading: chartLoading }
);
