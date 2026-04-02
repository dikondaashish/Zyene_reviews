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
import { Sparkles, Download, FileJson, Search, Gauge, Globe, MousePointer2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EngagementFunnelCard } from "@/components/analytics/engagement-funnel-card";

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

    // Trend & Volume Data
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
        { name: "Positive", value: sentimentCounts.positive, color: "#10b981" },
        { name: "Neutral", value: sentimentCounts.neutral, color: "#94a3b8" },
        { name: "Negative", value: sentimentCounts.negative, color: "#f43f5e" },
        { name: "Mixed", value: sentimentCounts.mixed, color: "#f59e0b" },
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

    const rangeLabel = range === "7d" ? "Last 7 Days" : range === "30d" ? "Last 30 Days" : range === "90d" ? "Last 90 Days" : "Last 12 Months";

    return (
        <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 overflow-x-hidden relative">
            {/* Premium background decorative elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

            <MilestoneCelebration currentCount={totalReviews} type="reviews" isDemo={isDemo} />
            <MilestoneCelebration currentCount={avgRating} type="rating" isDemo={isDemo} />

            {isDemo && <DemoModeBanner className="mb-2" />}

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
                        Analytics
                        {isDemo && (
                            <Badge variant="outline" className="border-indigo-200 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/50 flex items-center gap-1.5 px-3 py-1 font-bold tracking-tight">
                                <Sparkles className="w-3.5 h-3.5" />
                                Interactive Demo
                            </Badge>
                        )}
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        Real-time performance metrics for <span className="text-foreground font-bold">{business?.name || "your business"}</span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-2 bg-background/50 backdrop-blur-md p-1.5 rounded-xl border shadow-sm">
                        <ReportGenerator 
                            businessName={business?.name} 
                            dateRange={rangeLabel} 
                        />
                        <ExportDataButton businessId={businessId} range={range} />
                    </div>
                    <AnalyticsFilters />
                </div>
            </div>

            <div id="analytics-content" className="flex flex-col gap-8 w-full relative">
                
                {/* 1. Key Metrics - Bento Row */}
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

                {/* 2. Primary Trends - Bento Row */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="lg:col-span-2 border-2 border-transparent bg-background/60 backdrop-blur-xl shadow-sm transition-all hover:border-primary/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Gauge className="w-5 h-5 text-primary" />
                                    Rating Trend
                                </CardTitle>
                                <p className="text-xs text-muted-foreground font-medium">Average score fluctuations daily</p>
                            </div>
                            <Badge variant="secondary" className="font-bold">Avg: {avgRating.toFixed(1)}</Badge>
                        </CardHeader>
                        <CardContent className="pl-0 pb-6">
                            <RatingsChart data={trendData} overallAvg={avgRating} />
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-transparent bg-background/60 backdrop-blur-xl shadow-sm transition-all hover:border-primary/10">
                        <CardHeader>
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <FileJson className="w-5 h-5 text-primary" />
                                    Sentiment Breakdown
                                </CardTitle>
                                <p className="text-xs text-muted-foreground font-medium">AI-analyzed review emotional tone</p>
                            </div>
                        </CardHeader>
                        <CardContent className="pb-6">
                            <SentimentChart data={sentimentData} />
                        </CardContent>
                    </Card>
                </div>

                {/* 3. Volume & Themes - Bento Row */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                    <Card className="lg:col-span-3 border-2 border-transparent bg-background/60 backdrop-blur-xl shadow-sm transition-all hover:border-primary/10">
                        <CardHeader>
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-primary" />
                                    Review Volume
                                </CardTitle>
                                <p className="text-xs text-muted-foreground font-medium">Total review count across distribution channels</p>
                            </div>
                        </CardHeader>
                        <CardContent className="pl-0 pb-6">
                            <VolumeChart data={trendData} />
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 border-2 border-transparent bg-background/60 backdrop-blur-xl shadow-sm transition-all hover:border-primary/10">
                        <CardHeader>
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    Common Themes
                                </CardTitle>
                                <p className="text-xs text-muted-foreground font-medium">Key topics frequently mentioned in reviews</p>
                            </div>
                        </CardHeader>
                        <CardContent className="pb-6">
                            <ThemeChart data={themeData} />
                        </CardContent>
                    </Card>
                </div>

                {/* 4. Google Specific Metrics - Deluxe Insights */}
                {isGoogleConnected && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mt-4">
                            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Google Business Insights</h2>
                            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                        </div>

                        <Card className="border-2 border-transparent bg-background/60 backdrop-blur-xl shadow-sm transition-all hover:border-primary/10">
                            <CardHeader className="pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <MousePointer2 className="w-5 h-5 text-blue-500" />
                                        Listing Performance
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground font-medium">Daily metrics from Google Business Profile Performance ({rangeLabel})</p>
                                </div>
                            </CardHeader>
                            <CardContent className="pl-0 pb-6">
                                <GooglePerformanceProfileChart data={perfSeries} />
                            </CardContent>
                        </Card>

                        <div className="grid gap-6 md:grid-cols-3">
                            {/* Search Keywords */}
                            <Card className="md:col-span-2 border-2 border-transparent bg-background/60 backdrop-blur-xl shadow-sm transition-all hover:border-primary/10 h-full">
                                <CardHeader className="pb-4">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <Search className="w-5 h-5 text-orange-500" />
                                            Search Keywords
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground font-medium">Monthly impressions per keyword from local discovery</p>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {searchKeywords.length === 0 ? (
                                        <div className="flex h-[280px] items-center justify-center border border-dashed rounded-xl bg-muted/5">
                                            <p className="text-sm text-muted-foreground font-medium italic">
                                                No keyword data yet. Sync dashboard or wait 24h.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border bg-card/30 overflow-hidden">
                                            <ul className="divide-y max-h-[320px] overflow-y-auto">
                                                {searchKeywords.slice(0, 15).map((k, idx) => (
                                                    <li
                                                        key={`${k.monthStart}-${k.keyword}`}
                                                        className="flex items-center justify-between gap-4 px-4 py-3 text-sm transition-colors hover:bg-muted/30"
                                                    >
                                                        <div className="flex items-center gap-3 truncate">
                                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-[10px] font-black text-primary shrink-0">{idx + 1}</span>
                                                            <span className="font-bold truncate" title={k.keyword}>
                                                                {k.keyword}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                                                                <div 
                                                                    className="h-full bg-primary/40 rounded-full" 
                                                                    style={{ width: `${Math.min(100, (k.impressions / (searchKeywords[0]?.impressions || 1)) * 100)}%` }}
                                                                />
                                                            </div>
                                                            <span className="tabular-nums font-black text-foreground shrink-0 min-w-[3rem] text-right">
                                                                {k.impressions.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Discovery Type */}
                            <Card className="border-2 border-transparent bg-background/60 backdrop-blur-xl shadow-sm transition-all hover:border-primary/10 h-full flex flex-col">
                                <CardHeader>
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold">Discovery Type</CardTitle>
                                        <p className="text-xs text-muted-foreground font-medium">Business name vs categories</p>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-center space-y-8 pb-10 px-8">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                Discovery
                                            </p>
                                            <p className="text-3xl font-black text-primary">{discoverySplit.discoveryPct}%</p>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${discoverySplit.discoveryPct}%` }} />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                Branded
                                            </p>
                                            <p className="text-2xl font-black text-muted-foreground/50">{discoverySplit.directPct}%</p>
                                        </div>
                                        <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                                            <div className="h-full bg-muted-foreground/20 rounded-full transition-all duration-1000" style={{ width: `${discoverySplit.directPct}%` }} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Engagement Funnel - Functional Component */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Engagement Funnel</h3>
                                <div className="h-[1px] flex-1 bg-border/50" />
                            </div>
                            <EngagementFunnelCard 
                                profileViews={perfTotals?.profileViews ?? 0}
                                websiteClicks={perfTotals?.websiteClicks ?? 0}
                                callClicks={perfTotals?.callClicks ?? 0}
                                directionRequests={perfTotals?.directionRequests ?? 0}
                            />
                        </div>
                    </div>
                )}

                {/* 5. Platform Performance Table */}
                <div className="space-y-4 mt-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Platform Comparison</h2>
                        <div className="h-[1px] flex-1 bg-border/50" />
                    </div>
                    <PlatformTable data={platformData} />
                </div>
            </div>
        </div>
    );
}


