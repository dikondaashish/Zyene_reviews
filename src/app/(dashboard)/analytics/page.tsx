import { Suspense } from "react";
import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsFilters } from "@/components/analytics/analytics-filters";
import { RatingsChart } from "@/components/analytics/ratings-chart";
import { VolumeChart } from "@/components/analytics/volume-chart";
import { SentimentChart } from "@/components/analytics/sentiment-chart";
import { ThemeChart } from "@/components/analytics/theme-chart";
import { PlatformTable } from "@/components/analytics/platform-table";
import { GooglePerformanceProfileChart } from "@/components/analytics/google-performance-profile-chart";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import {
    estimateDiscoverySplit,
    getGooglePerformanceDailySeries,
    getGooglePerformanceTotals,
    getGoogleSearchKeywords,
} from "@/services/google/performance-queries";
import { StatsCard } from "@/components/analytics/stats-card";
import { ExportDataButton } from "@/components/analytics/export-data-button";
import { ReportGenerator } from "@/components/analytics/report-generator";
import { MilestoneCelebration } from "@/components/dashboard/milestone-celebration";
import { DemoModeBanner } from "@/components/dashboard/demo-mode-banner";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Helper with comparison support
function getPeriods(range: string) {
    const now = new Date();
    const currentEnd = new Date(now);
    let currentStart: Date;
    let previousEnd: Date;
    let previousStart: Date;

    switch (range) {
        case "7d":
            currentStart = new Date(now.setDate(now.getDate() - 7));
            previousEnd = new Date(currentStart);
            previousStart = new Date(new Date(currentStart).setDate(currentStart.getDate() - 7));
            break;
        case "30d":
            currentStart = new Date(now.setDate(now.getDate() - 30));
            previousEnd = new Date(currentStart);
            previousStart = new Date(new Date(currentStart).setDate(currentStart.getDate() - 30));
            break;
        case "90d":
            currentStart = new Date(now.setDate(now.getDate() - 90));
            previousEnd = new Date(currentStart);
            previousStart = new Date(new Date(currentStart).setDate(currentStart.getDate() - 90));
            break;
        case "12m":
            currentStart = new Date(now.setFullYear(now.getFullYear() - 1));
            previousEnd = new Date(currentStart);
            previousStart = new Date(new Date(currentStart).setFullYear(currentStart.getFullYear() - 1));
            break;
        default:
            currentStart = new Date(now.setDate(now.getDate() - 30));
            previousEnd = new Date(currentStart);
            previousStart = new Date(new Date(currentStart).setDate(currentStart.getDate() - 30));
    }
    return { currentStart, currentEnd, previousStart, previousEnd };
}

export default async function AnalyticsPage({
    searchParams,
}: {
    searchParams: Promise<{ range?: string }>;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    const { businessId, business } = await getActiveBusinessId();
    const sp = await searchParams;
    const range = sp.range || "30d";
    const { currentStart, currentEnd, previousStart } = getPeriods(range);

    // 1. Fetch Reviews (current + previous)
    let reviewsQuery = supabase
        .from("reviews")
        .select("*")
        .gte("created_at", previousStart.toISOString())
        .order("created_at", { ascending: true });

    if (businessId) {
        reviewsQuery = reviewsQuery.eq("business_id", businessId);
    }

    // 2. Fetch Review Requests (current + previous)
    let requestsQuery = supabase
        .from("review_requests")
        .select("created_at")
        .gte("created_at", previousStart.toISOString());

    if (businessId) {
        requestsQuery = requestsQuery.eq("business_id", businessId);
    }

    const [{ data: allReviews }, { data: allRequests }] = await Promise.all([
        reviewsQuery,
        requestsQuery,
    ]);

    const currentReviews = (allReviews || []).filter(r => new Date(r.created_at) >= currentStart);
    const previousReviews = (allReviews || []).filter(r => new Date(r.created_at) < currentStart);
    const currentRequests = (allRequests || []).filter(r => new Date(r.created_at) >= currentStart);
    const previousRequests = (allRequests || []).filter(r => new Date(r.created_at) < currentStart);

    // --- Aggregations ---

    // Stats (Current)
    const totalReviews = currentReviews.length;
    const totalRating = currentReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const avgRating = totalReviews > 0 ? totalRating / totalReviews : 0;
    const respondedCount = currentReviews.filter((r) => r.response_status === "responded" || r.responded_at).length;
    const responseRate = totalReviews > 0 ? (respondedCount / totalReviews) * 100 : 0;
    const requestsCount = currentRequests.length;

    // Stats (Previous)
    const prevTotalReviews = previousReviews.length;
    const prevTotalRating = previousReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const prevAvgRating = prevTotalReviews > 0 ? prevTotalRating / prevTotalReviews : 0;
    const prevRespondedCount = previousReviews.filter((r) => r.response_status === "responded" || r.responded_at).length;
    const prevResponseRate = prevTotalReviews > 0 ? (prevRespondedCount / prevTotalReviews) * 100 : 0;
    const prevRequestsCount = previousRequests.length;

    // Delta Calculations
    const getDelta = (curr: number, prev: number) => {
        if (prev === 0) return curr > 0 ? 100 : 0;
        return ((curr - prev) / prev) * 100;
    };

    const reviewsDelta = getDelta(totalReviews, prevTotalReviews);
    const ratingDelta = getDelta(avgRating, prevAvgRating);
    const responseRateDelta = getDelta(responseRate, prevResponseRate);
    const requestsDelta = getDelta(requestsCount, prevRequestsCount);

    // Trend & Volume Data (Group current currentReviews by Date)
    const dateMap = new Map<string, { date: string; ratingSum: number; count: number; positive: number; neutral: number; negative: number }>();

    currentReviews.forEach((r) => {
        const date = new Date(r.created_at).toISOString().split('T')[0];
        if (!dateMap.has(date)) {
            dateMap.set(date, { date, ratingSum: 0, count: 0, positive: 0, neutral: 0, negative: 0 });
        }
        const entry = dateMap.get(date)!;
        entry.ratingSum += r.rating || 0;
        entry.count += 1;

        const rating = r.rating || 0;
        if (rating >= 4) entry.positive++;
        else if (rating === 3) entry.neutral++;
        else entry.negative++;
    });

    const trendData = Array.from(dateMap.values())
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(d => ({
            date: d.date,
            rating: d.ratingSum / d.count,
            count: d.count,
            positive: d.positive,
            neutral: d.neutral,
            negative: d.negative
        }));

    // Sentiment Data
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0, mixed: 0 };
    currentReviews.forEach((r) => {
        const s = (r.sentiment || "").toLowerCase();
        if (s === "positive") sentimentCounts.positive++;
        else if (s === "negative") sentimentCounts.negative++;
        else if (s === "mixed") sentimentCounts.mixed++;
        else sentimentCounts.neutral++;
    });

    const sentimentData = [
        { name: "Positive", value: sentimentCounts.positive, color: "#22c55e" },
        { name: "Neutral", value: sentimentCounts.neutral, color: "#94a3b8" },
        { name: "Negative", value: sentimentCounts.negative, color: "#ef4444" },
        { name: "Mixed", value: sentimentCounts.mixed, color: "#eab308" },
    ].filter(d => d.value > 0);

    // Theme Data
    const themeMap = new Map<string, { count: number; sentimentScore: number }>();
    currentReviews.forEach((r) => {
        if (Array.isArray(r.themes)) {
            r.themes.forEach((t: string) => {
                const theme = t.toLowerCase();
                if (!themeMap.has(theme)) themeMap.set(theme, { count: 0, sentimentScore: 0 });
                const entry = themeMap.get(theme)!;
                entry.count++;
                if (r.rating && r.rating >= 4) entry.sentimentScore++;
                if (r.rating && r.rating <= 2) entry.sentimentScore--;
            });
        }
    });

    const themeData = Array.from(themeMap.entries())
        .map(([theme, data]) => ({ theme, ...data }))
        .filter(t => t.count >= 2)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const isGoogleConnected = !!business?.review_platforms?.find((p: any) => p.platform === "google");
    const isDemo = !isGoogleConnected;

    let perfTotals: Awaited<ReturnType<typeof getGooglePerformanceTotals>> = null;
    let perfSeries: Awaited<ReturnType<typeof getGooglePerformanceDailySeries>> = [];
    let searchKeywords: Awaited<ReturnType<typeof getGoogleSearchKeywords>> = [];
    let discoverySplit = { discoveryPct: 0, directPct: 0 };

    if (businessId && isGoogleConnected) {
        perfTotals = await getGooglePerformanceTotals(supabase, businessId, currentStart, currentEnd);
        perfSeries = await getGooglePerformanceDailySeries(supabase, businessId, currentStart, currentEnd);
        searchKeywords = await getGoogleSearchKeywords(supabase, businessId, 30);
        discoverySplit = estimateDiscoverySplit(
            searchKeywords.map((k) => ({ keyword: k.keyword, impressions: k.impressions })),
            (business as { name?: string })?.name || ""
        );
    }

    const platformData = [
        {
            platform: "Google",
            reviews: totalReviews,
            avgRating: avgRating,
            responseRate: responseRate,
            profileViews: perfTotals?.profileViews,
            callClicks: perfTotals?.callClicks,
            directionRequests: perfTotals?.directionRequests,
            websiteClicks: perfTotals?.websiteClicks,
        },
    ];

    const funnelMax = Math.max(
        perfTotals?.profileViews ?? 0,
        perfTotals?.websiteClicks ?? 0,
        perfTotals?.callClicks ?? 0,
        perfTotals?.directionRequests ?? 0,
        1
    );

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 overflow-hidden">
            <MilestoneCelebration currentCount={totalReviews} type="reviews" isDemo={isDemo} />
            <MilestoneCelebration currentCount={avgRating} type="rating" isDemo={isDemo} />

            {isDemo && <DemoModeBanner className="mb-2" />}

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        Analytics
                        {isDemo && (
                            <Badge variant="outline" className="border-indigo-200 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/50 flex items-center gap-1 px-2.5 py-0.5 font-normal tracking-tight">
                                <Sparkles className="w-3 h-3" />
                                Interactive Demo
                            </Badge>
                        )}
                    </h1>
                    <div className="flex items-center gap-2">
                        <ReportGenerator 
                            businessName={business?.name} 
                            dateRange={range === "7d" ? "Last 7 Days" : range === "30d" ? "Last 30 Days" : range === "90d" ? "Last 90 Days" : "Last 12 Months"} 
                        />
                        <ExportDataButton businessId={businessId} range={range} />
                    </div>
                </div>
                <AnalyticsFilters />
            </div>

            <div id="analytics-content" className="flex flex-col gap-6 w-full bg-background p-1">

            {/* Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard 
                    title="New Reviews"
                    value={totalReviews}
                    description="In selected period"
                    trend={{ value: reviewsDelta, label: "vs last period" }}
                    isDemo={isDemo}
                />
                <StatsCard 
                    title="Average Rating"
                    value={avgRating.toFixed(1)}
                    description={`Based on ${totalReviews} reviews`}
                    trend={{ value: ratingDelta, label: "vs last period" }}
                    isDemo={isDemo}
                />
                <StatsCard 
                    title="Response Rate"
                    value={`${responseRate.toFixed(0)}%`}
                    description={`${respondedCount} responded`}
                    trend={{ value: responseRateDelta, label: "vs last period" }}
                    isDemo={isDemo}
                />
                <StatsCard 
                    title="Requests Sent"
                    value={requestsCount}
                    description="Review invitations"
                    trend={{ value: requestsDelta, label: "vs last period" }}
                    isDemo={isDemo}
                />
            </div>

            {/* Main Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Rating Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <RatingsChart data={trendData} overallAvg={avgRating} />
                    </CardContent>
                </Card>
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Review Volume</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <VolumeChart data={trendData} />
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Charts */}
            <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-4 md:col-span-3">
                    <CardHeader>
                        <CardTitle>Sentiment Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SentimentChart data={sentimentData} />
                    </CardContent>
                </Card>
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Common Themes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ThemeChart data={themeData} />
                    </CardContent>
                </Card>
            </div>

            {isGoogleConnected && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Google listing performance</CardTitle>
                            <p className="text-sm text-muted-foreground font-normal">
                                Daily metrics from Google Business Profile Performance (selected period)
                            </p>
                        </CardHeader>
                        <CardContent>
                            <GooglePerformanceProfileChart data={perfSeries} />
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Search keywords</CardTitle>
                                <p className="text-sm text-muted-foreground font-normal">
                                    Monthly impressions per keyword (most recent months first)
                                </p>
                            </CardHeader>
                            <CardContent>
                                {searchKeywords.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No keyword data yet. Run Sync on the dashboard or wait for the daily job.
                                    </p>
                                ) : (
                                    <ul className="divide-y rounded-md border max-h-[280px] overflow-y-auto">
                                        {searchKeywords.slice(0, 25).map((k) => (
                                            <li
                                                key={`${k.monthStart}-${k.keyword}`}
                                                className="flex justify-between gap-2 px-3 py-2 text-sm"
                                            >
                                                <span className="truncate" title={k.keyword}>
                                                    {k.keyword}
                                                </span>
                                                <span className="tabular-nums text-muted-foreground shrink-0">
                                                    {k.impressions.toLocaleString()}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Discovery vs branded (estimate)</CardTitle>
                                <p className="text-sm text-muted-foreground font-normal">
                                    Uses your business name vs search terms — refine in a later release
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                        Discovery-style terms
                                    </p>
                                    <p className="text-3xl font-bold">{discoverySplit.discoveryPct}%</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                        Branded / name match
                                    </p>
                                    <p className="text-2xl font-semibold text-muted-foreground">
                                        {discoverySplit.directPct}%
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Engagement funnel</CardTitle>
                            <p className="text-sm text-muted-foreground font-normal">
                                Relative volume across Google listing actions (selected period)
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {(
                                    [
                                        ["Profile views", perfTotals?.profileViews ?? 0],
                                        ["Website clicks", perfTotals?.websiteClicks ?? 0],
                                        ["Call clicks", perfTotals?.callClicks ?? 0],
                                        ["Direction requests", perfTotals?.directionRequests ?? 0],
                                    ] as const
                                ).map(([label, val]) => (
                                    <div key={label} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{label}</span>
                                            <span className="font-medium tabular-nums">
                                                {val.toLocaleString()}
                                            </span>
                                        </div>
                                        <Progress
                                            value={Math.min(100, (val / funnelMax) * 100)}
                                            className="h-2"
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Platform Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Platform Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <PlatformTable data={platformData} />
                </CardContent>
            </Card>
            </div>
        </div>
    );
}

