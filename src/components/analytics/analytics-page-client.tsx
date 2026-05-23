"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsFilters } from "@/components/analytics/analytics-filters";
import { StatsCard } from "@/components/analytics/stats-card";
import { ExportDataButton } from "@/components/analytics/export-data-button";
import { MilestoneCelebration } from "@/components/dashboard/milestone-celebration";
import { DemoModeBanner } from "@/components/dashboard/demo-mode-banner";
import { Sparkles, Search, Gauge, Globe, MousePointer2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PlatformTabs } from "@/components/analytics/platform-tabs";
import type { AnalyticsFullRangePayload } from "@/lib/analytics/build-analytics-range-payload";
import type { AnalyticsRange } from "@/lib/analytics/date-range";
import { useAnalyticsFullRangeQuery } from "@/hooks/use-range-queries";
import type { RangeKey } from "@/lib/query/date-range-keys";

const RatingsChart = dynamic(
    () => import("@/components/analytics/ratings-chart").then((m) => m.RatingsChart),
    { ssr: false }
);
const VolumeChart = dynamic(
    () => import("@/components/analytics/volume-chart").then((m) => m.VolumeChart),
    { ssr: false }
);
const SentimentChart = dynamic(
    () => import("@/components/analytics/sentiment-chart").then((m) => m.SentimentChart),
    { ssr: false }
);
const ThemeChart = dynamic(
    () => import("@/components/analytics/theme-chart").then((m) => m.ThemeChart),
    { ssr: false }
);
const PlatformTable = dynamic(
    () => import("@/components/analytics/platform-table").then((m) => m.PlatformTable),
    { ssr: false }
);
const GooglePerformanceProfileChart = dynamic(
    () =>
        import("@/components/analytics/google-performance-profile-chart").then(
            (m) => m.GooglePerformanceProfileChart
        ),
    { ssr: false }
);
const ReportGenerator = dynamic(
    () => import("@/components/analytics/report-generator").then((m) => m.ReportGenerator),
    { ssr: false }
);
const EngagementFunnelCard = dynamic(
    () => import("@/components/analytics/engagement-funnel-card").then((m) => m.EngagementFunnelCard),
    { ssr: false }
);
const ZyenePlatformAnalytics = dynamic(
    () => import("@/components/analytics/zyene-platform-analytics").then((m) => m.ZyenePlatformAnalytics),
    { ssr: false }
);

export function AnalyticsPageClient({
    businessId,
    businessName,
    businessSlug,
    initialPayload,
}: {
    businessId: string;
    businessName: string;
    businessSlug: string;
    initialPayload: AnalyticsFullRangePayload;
}) {
    const [range, setRange] = useState<AnalyticsRange>(() => initialPayload.range);
    const [platform, setPlatform] = useState(() => initialPayload.platform);

    const seedInitial =
        range === initialPayload.range && platform === initialPayload.platform
            ? initialPayload
            : undefined;

    const { data: queryData } = useAnalyticsFullRangeQuery(
        businessId,
        range as RangeKey,
        platform,
        seedInitial
    );

    const d = queryData ?? initialPayload;
    const isDemo = d.isDemo;
    const isGoogleConnected = d.connectedPlatforms.includes("google");

    useEffect(() => {
        const params = new URLSearchParams();
        if (range !== "30d") params.set("range", range);
        if (platform !== "all") params.set("platform", platform);
        const qs = params.toString();
        const path = qs ? `/analytics?${qs}` : "/analytics";
        window.history.replaceState(null, "", path);
    }, [range, platform]);

    const searchKeywords = d.searchKeywords ?? [];

    const perfTotals = d.perfTotals as
        | {
              profileViews?: number;
              websiteClicks?: number;
              callClicks?: number;
              directionRequests?: number;
          }
        | null;

    return (
        <div className="relative flex min-w-0 flex-1 flex-col gap-8 overflow-x-hidden p-4 text-foreground md:p-8">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold tracking-tight sm:gap-3 sm:text-4xl">
                            <Gauge className="w-9 h-9 text-primary" />
                            Analytics
                            {isDemo && (
                                <Badge
                                    variant="outline"
                                    className="border-primary/30 bg-primary/10 text-primary flex items-center gap-1.5 px-3 font-bold tracking-tight"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Demo
                                </Badge>
                            )}
                        </h1>
                        <p className="text-muted-foreground font-medium">
                            Real-time performance metrics for{" "}
                            <span className="font-bold">{businessName || "your business"}</span>
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-2 rounded-xl border border-border/50 bg-muted/40 p-1 backdrop-blur-md sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                        <ReportGenerator businessName={businessName || undefined} dateRange={d.rangeLabel} />
                        <ExportDataButton businessId={businessId} range={range} platform={platform} />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-y border-border/30">
                    <PlatformTabs
                        platforms={d.connectedPlatforms}
                        activePlatform={platform}
                        businessSlug={businessSlug}
                        onPlatformChange={(id) => setPlatform(id)}
                    />
                    <AnalyticsFilters
                        businessId={businessId}
                        range={range as RangeKey}
                        platform={platform}
                        onRangeChange={setRange}
                    />
                </div>
            </div>

            <MilestoneCelebration currentCount={d.stats.totalReviews} type="reviews" isDemo={isDemo} />
            <MilestoneCelebration currentCount={d.stats.avgRating} type="rating" isDemo={isDemo} />

            {isDemo && <DemoModeBanner className="mb-2" />}

            <div id="analytics-content" className="flex flex-col gap-8 w-full relative">
                {platform === "zyene" ? (
                    <Suspense
                        fallback={
                            <div className="h-[420px] rounded-xl border border-border bg-card/60 animate-pulse" />
                        }
                    >
                        <ZyenePlatformAnalytics
                            requests={(d.allRequests || []) as never[]}
                            previousRequests={(d.previousRequests || []) as never[]}
                            privateFeedback={d.privateFeedback as never}
                            dateRange={d.rangeLabel}
                        />
                    </Suspense>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <StatsCard
                                title="New Reviews"
                                value={d.stats.totalReviews}
                                description="Reviews whose review date falls in this period"
                                trend={
                                    d.stats.reviewsDelta === null
                                        ? undefined
                                        : { value: d.stats.reviewsDelta, label: "vs last period" }
                                }
                                isDemo={isDemo}
                            />
                            <StatsCard
                                title="Average Rating"
                                value={d.stats.avgRating.toFixed(1)}
                                description={`Based on ${d.stats.totalReviews} reviews (same date window)`}
                                trend={
                                    d.stats.ratingDelta === null
                                        ? undefined
                                        : { value: d.stats.ratingDelta, label: "vs last period" }
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
                                    d.stats.requestsDelta === null
                                        ? undefined
                                        : { value: d.stats.requestsDelta, label: "vs last period" }
                                }
                                isDemo={isDemo}
                            />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Card className="lg:col-span-2 bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <Gauge className="w-5 h-5 text-primary" />
                                            Rating Trend
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground font-medium">
                                            Average score fluctuations daily
                                        </p>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className="font-bold bg-primary/10 text-primary border-primary/20"
                                    >
                                        Avg: {d.stats.avgRating.toFixed(1)}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="pl-0 pb-6">
                                    <Suspense
                                        fallback={
                                            <div className="h-[280px] rounded-lg bg-muted/40 animate-pulse" />
                                        }
                                    >
                                        <RatingsChart data={d.trendData} overallAvg={d.stats.avgRating} />
                                    </Suspense>
                                </CardContent>
                            </Card>

                            <Card className="bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20">
                                <CardHeader>
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-primary" />
                                            Sentiment Breakdown
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground font-medium">
                                            AI-analyzed review emotional tone
                                        </p>
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-6">
                                    <Suspense
                                        fallback={
                                            <div className="h-[220px] rounded-lg bg-muted/40 animate-pulse" />
                                        }
                                    >
                                        <SentimentChart data={d.sentimentData} />
                                    </Suspense>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                            <Card className="lg:col-span-3 bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20">
                                <CardHeader>
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <Globe className="w-5 h-5 text-primary" />
                                            Review Volume
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground font-medium">
                                            Total review count across distribution channels
                                        </p>
                                    </div>
                                </CardHeader>
                                <CardContent className="pl-0 pb-6">
                                    <Suspense
                                        fallback={
                                            <div className="h-[260px] rounded-lg bg-muted/40 animate-pulse" />
                                        }
                                    >
                                        <VolumeChart data={d.trendData} />
                                    </Suspense>
                                </CardContent>
                            </Card>

                            <Card className="lg:col-span-2 bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20">
                                <CardHeader>
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-primary" />
                                            Common Themes
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground font-medium">
                                            Key topics frequently mentioned in reviews
                                        </p>
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-6">
                                    <Suspense
                                        fallback={
                                            <div className="h-[220px] rounded-lg bg-muted/40 animate-pulse" />
                                        }
                                    >
                                        <ThemeChart data={d.themeData} />
                                    </Suspense>
                                </CardContent>
                            </Card>
                        </div>

                        {(platform === "all" || platform === "google") && isGoogleConnected && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mt-4">
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                                        Google Business Insights
                                    </h2>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                                </div>

                                <div className="flex flex-col gap-6">
                                    <Card className="bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20 overflow-hidden">
                                        <CardHeader className="pb-2">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                                    <MousePointer2 className="w-5 h-5 text-primary" />
                                                    Listing Performance
                                                </CardTitle>
                                                <p className="text-xs text-muted-foreground font-medium">
                                                    Daily metrics from Google Business Profile Performance (
                                                    {d.rangeLabel})
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pl-0 pb-6">
                                            <Suspense
                                                fallback={
                                                    <div className="h-[260px] rounded-lg bg-muted/40 animate-pulse" />
                                                }
                                            >
                                                <GooglePerformanceProfileChart data={d.perfSeries as never[]} />
                                            </Suspense>
                                        </CardContent>
                                    </Card>

                                    <Suspense
                                        fallback={
                                            <div className="h-[220px] rounded-lg bg-muted/40 animate-pulse" />
                                        }
                                    >
                                        <EngagementFunnelCard
                                            profileViews={perfTotals?.profileViews ?? 0}
                                            websiteClicks={perfTotals?.websiteClicks ?? 0}
                                            callClicks={perfTotals?.callClicks ?? 0}
                                            directionRequests={perfTotals?.directionRequests ?? 0}
                                        />
                                    </Suspense>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <Card className="lg:col-span-2 bg-card/60 border-border/50 backdrop-blur-md overflow-hidden group hover:border-primary/30 transition-all duration-500">
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                                    <Search className="w-5 h-5 text-primary" />
                                                    Search Keywords
                                                </CardTitle>
                                                <p className="text-xs text-muted-foreground font-medium">
                                                    Monthly impressions per keyword from local discovery
                                                </p>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="bg-primary/10 text-primary border-primary/20"
                                            >
                                                Top {searchKeywords.length} Keywords
                                            </Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {searchKeywords.slice(0, 10).map((k, i) => (
                                                    <div key={i} className="flex items-center justify-between group/item">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 rounded-lg bg-muted/40 flex items-center justify-center text-[10px] font-bold text-muted-foreground group-hover/item:bg-primary/20 group-hover/item:text-primary transition-colors">
                                                                {i + 1}
                                                            </div>
                                                            <span className="text-sm text-foreground/70 group-hover/item:text-foreground transition-colors">
                                                                {k.keyword}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-1.5 w-32 bg-muted/40 rounded-full overflow-hidden hidden sm:block">
                                                                <div
                                                                    className="h-full bg-primary/40 group-hover/item:bg-primary transition-all duration-1000"
                                                                    style={{
                                                                        width: `${Math.min(
                                                                            100,
                                                                            (Number(k.impressions) /
                                                                                Math.max(
                                                                                    1,
                                                                                    ...searchKeywords.map((sk) =>
                                                                                        Number(sk.impressions)
                                                                                    )
                                                                                )) *
                                                                                100
                                                                        )}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-sm font-mono font-bold text-muted-foreground group-hover/item:text-primary transition-colors">
                                                                {Number(k.impressions).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {searchKeywords.length === 0 && (
                                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-2">
                                                        <Search className="w-10 h-10 opacity-20" />
                                                        <p className="text-sm">No keyword data available for this selection</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-card/60 border-border/50 backdrop-blur-md transition-all hover:border-primary/20 flex flex-col">
                                        <CardHeader>
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg font-bold">Discovery Type</CardTitle>
                                                <p className="text-xs text-muted-foreground font-medium">
                                                    Business name vs categories
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col justify-center space-y-8 pb-10 px-8">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-end">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                            Discovery
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Found via category/service
                                                        </p>
                                                    </div>
                                                    <p className="text-3xl font-black text-primary">
                                                        {d.discoverySplit.discoveryPct}%
                                                    </p>
                                                </div>
                                                <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full"
                                                        style={{ width: `${d.discoverySplit.discoveryPct}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-end">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                            Branded
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Found via business name
                                                        </p>
                                                    </div>
                                                    <p className="text-2xl font-black text-muted-foreground">
                                                        {d.discoverySplit.directPct}%
                                                    </p>
                                                </div>
                                                <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-foreground/60 rounded-full"
                                                        style={{ width: `${d.discoverySplit.directPct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {platform === "all" && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                                        Platform Comparison
                                    </h2>
                                    <div className="h-[1px] flex-1 bg-border/30" />
                                </div>
                                <Suspense
                                    fallback={<div className="h-[220px] rounded-lg bg-muted/40 animate-pulse" />}
                                >
                                    <PlatformTable data={d.platformData} />
                                </Suspense>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
