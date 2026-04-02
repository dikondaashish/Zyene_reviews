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
import { Sparkles, Search, Gauge, Globe, MousePointer2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EngagementFunnelCard } from "@/components/analytics/engagement-funnel-card";
import { PlatformTabs } from "@/components/analytics/platform-tabs";
import { ZyenePlatformAnalytics } from "@/components/analytics/zyene-platform-analytics";

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
    searchParams: Promise<{ range?: string; platform?: string }>;
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
    const platform = sp.platform || "all";
    const { currentStart, currentEnd, previousStart } = getPeriods(range);

    if (!businessId) {
        return <div>No business selected.</div>;
    }

    // 1. Fetch Reviews (current + previous)
    let reviewsQuery = supabase
        .from("reviews")
        .select("*")
        .eq("business_id", businessId)
        .gte("created_at", previousStart.toISOString())
        .order("created_at", { ascending: true });

    if (platform === "zyene") {
        reviewsQuery = reviewsQuery.or('platform.eq.zyene,platform.is.null');
    } else if (platform !== "all") {
        reviewsQuery = reviewsQuery.eq("platform", platform);
    }

    // 2. Fetch Review Requests (current + previous)
    // For Zyene platform, we fetch all columns for rich analytics
    const requestsQuery = supabase
        .from("review_requests")
        .select("*")
        .eq("business_id", businessId)
        .gte("created_at", previousStart.toISOString());

    // 3. Fetch Private Feedback (only when Zyene platform selected)
    const privateFeedbackQuery = platform === "zyene"
        ? supabase
              .from("private_feedback")
              .select("id,rating,content,created_at")
              .eq("business_id", businessId)
              .gte("created_at", currentStart.toISOString())
              .order("created_at", { ascending: false })
              .limit(50)
        : null;

    const [{ data: allReviews }, { data: allRequests }, { data: reviewPlatforms }, privateFeedbackResult] = await Promise.all([
        reviewsQuery,
        requestsQuery,
        supabase.from("review_platforms").select("platform").eq("business_id", businessId),
        privateFeedbackQuery ?? Promise.resolve({ data: null }),
    ]);

    const privateFeedback = (privateFeedbackResult as any)?.data || [];

    const connectedPlatforms = (reviewPlatforms || []).map(p => p.platform);

    const currentReviews = (allReviews || []).filter(r => new Date(r.created_at) >= currentStart);
    const previousReviews = (allReviews || []).filter(r => new Date(r.created_at) < currentStart);
    const currentRequests = (allRequests || []).filter(r => new Date(r.created_at) >= currentStart);
    const previousRequests = (allRequests || []).filter(r => new Date(r.created_at) < currentStart);

    // --- Aggregations ---
    const totalReviews = currentReviews.length;
    const totalRating = currentReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const avgRating = totalReviews > 0 ? totalRating / totalReviews : 0;
    const respondedCount = currentReviews.filter((r) => r.response_status === "responded" || r.responded_at).length;
    const responseRate = totalReviews > 0 ? (respondedCount / totalReviews) * 100 : 0;
    const requestsCount = currentRequests.length;

    const prevTotalReviews = previousReviews.length;
    const prevTotalRating = previousReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const prevAvgRating = prevTotalReviews > 0 ? prevTotalRating / prevTotalReviews : 0;
    const prevRespondedCount = previousReviews.filter((r) => r.response_status === "responded" || r.responded_at).length;
    const prevResponseRate = prevTotalReviews > 0 ? (prevRespondedCount / prevTotalReviews) * 100 : 0;
    const prevRequestsCount = previousRequests.length;

    const getDelta = (curr: number, prev: number) => {
        if (prev === 0) return curr > 0 ? 100 : 0;
        return ((curr - prev) / prev) * 100;
    };

    const reviewsDelta = getDelta(totalReviews, prevTotalReviews);
    const ratingDelta = getDelta(avgRating, prevAvgRating);
    const responseRateDelta = getDelta(responseRate, prevResponseRate);
    const requestsDelta = getDelta(requestsCount, prevRequestsCount);

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

    const isGoogleConnected = connectedPlatforms.includes("google");
    const isDemo = !isGoogleConnected;

    let perfTotals: any = null;
    let perfSeries: any[] = [];
    let searchKeywords: any[] = [];
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
        <div className="flex flex-1 flex-col gap-8 p-4 md:p-8 overflow-x-hidden relative text-foreground">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

            {/* Header / Nav Section */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
                            <Gauge className="w-9 h-9 text-[#f97316]" />
                            Analytics
                            {isDemo && (
                                <Badge variant="outline" className="border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center gap-1.5 px-3 font-bold tracking-tight">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Demo
                                </Badge>
                            )}
                        </h1>
                        <p className="text-slate-400 font-medium">
                            Real-time performance metrics for <span className="font-bold">{business?.name || "your business"}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-muted/40 p-1 rounded-xl border border-border/50 backdrop-blur-md">
                        <ReportGenerator 
                            businessName={business?.name} 
                            dateRange={rangeLabel} 
                        />
                        <ExportDataButton businessId={businessId as string} range={range} />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-y border-border/30">
                    <PlatformTabs 
                        platforms={connectedPlatforms} 
                        activePlatform={platform}
                        businessSlug={(business as any)?.slug || ""} 
                    />
                    <AnalyticsFilters />
                </div>
            </div>

            <MilestoneCelebration currentCount={totalReviews} type="reviews" isDemo={isDemo} />
            <MilestoneCelebration currentCount={avgRating} type="rating" isDemo={isDemo} />

            {isDemo && <DemoModeBanner className="mb-2" />}

            <div id="analytics-content" className="flex flex-col gap-8 w-full relative">

                {/* ─── OWN PLATFORM (ZYENE) ANALYTICS ─── */}
                {platform === "zyene" ? (
                    <ZyenePlatformAnalytics
                        requests={(allRequests || []) as any}
                        previousRequests={previousRequests as any}
                        privateFeedback={privateFeedback}
                        dateRange={rangeLabel}
                    />
                ) : (
                    <>
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
                    <Card className="lg:col-span-2 bg-card/60 border-border/50 backdrop-blur-md shadow-sm transition-all hover:border-orange-500/20">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Gauge className="w-5 h-5 text-[#f97316]" />
                                    Rating Trend
                                </CardTitle>
                                <p className="text-xs text-muted-foreground font-medium">Average score fluctuations daily</p>
                            </div>
                            <Badge variant="secondary" className="font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">Avg: {avgRating.toFixed(1)}</Badge>
                        </CardHeader>
                        <CardContent className="pl-0 pb-6">
                            <RatingsChart data={trendData} overallAvg={avgRating} />
                        </CardContent>
                    </Card>

                    <Card className="bg-card/60 border-border/50 backdrop-blur-md shadow-sm transition-all hover:border-orange-500/20">
                        <CardHeader>
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-[#f97316]" />
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
                    <Card className="lg:col-span-3 bg-card/60 border-border/50 backdrop-blur-md shadow-sm transition-all hover:border-orange-500/20">
                        <CardHeader>
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-[#f97316]" />
                                    Review Volume
                                </CardTitle>
                                <p className="text-xs text-muted-foreground font-medium">Total review count across distribution channels</p>
                            </div>
                        </CardHeader>
                        <CardContent className="pl-0 pb-6">
                            <VolumeChart data={trendData} />
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2 bg-card/60 border-border/50 backdrop-blur-md shadow-sm transition-all hover:border-orange-500/20">
                        <CardHeader>
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-[#f97316]" />
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

                {/* Google-specific metrics - Show if all or google selected */}
                {(platform === "all" || platform === "google") && isGoogleConnected && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mt-4">
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Google Business Insights</h2>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2 bg-card/60 border-border/50 backdrop-blur-md shadow-sm transition-all hover:border-orange-500/20 overflow-hidden">
                                <CardHeader className="pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <MousePointer2 className="w-5 h-5 text-[#f97316]" />
                                            Listing Performance
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground font-medium">Daily metrics from Google Business Profile Performance ({rangeLabel})</p>
                                    </div>
                                </CardHeader>
                                <CardContent className="pl-0 pb-6">
                                    <GooglePerformanceProfileChart data={perfSeries} />
                                </CardContent>
                            </Card>
                            
                            <EngagementFunnelCard 
                                profileViews={perfTotals?.profileViews ?? 0}
                                websiteClicks={perfTotals?.websiteClicks ?? 0}
                                callClicks={perfTotals?.callClicks ?? 0}
                                directionRequests={perfTotals?.directionRequests ?? 0}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                             {/* Search Keywords */}
                             <Card className="lg:col-span-2 bg-card/60 border-border/50 backdrop-blur-md overflow-hidden group hover:border-orange-500/30 transition-all duration-500">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                                            <Search className="w-5 h-5 text-[#f97316]" />
                                            Search Keywords
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground font-medium">Monthly impressions per keyword from local discovery</p>
                                    </div>
                                    <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">
                                        Top {(searchKeywords || []).length} Keywords
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {(searchKeywords || []).slice(0, 10).map((k: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between group/item">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-lg bg-muted/40 flex items-center justify-center text-[10px] font-bold text-muted-foreground group-hover/item:bg-orange-500/20 group-hover/item:text-orange-600 transition-colors">
                                                        {i + 1}
                                                    </div>
                                                    <span className="text-sm text-foreground/70 group-hover/item:text-foreground transition-colors">{k.keyword}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-1.5 w-32 bg-muted/40 rounded-full overflow-hidden hidden sm:block">
                                                        <div 
                                                            className="h-full bg-orange-500/40 group-hover/item:bg-[#f97316] transition-all duration-1000"
                                                            style={{ width: `${Math.min(100, (Number(k.impressions) / Math.max(...searchKeywords.map(sk => Number(sk.impressions)))) * 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-mono font-bold text-muted-foreground group-hover/item:text-orange-600 transition-colors">{Number(k.impressions).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {(!searchKeywords || searchKeywords.length === 0) && (
                                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-2">
                                                <Search className="w-10 h-10 opacity-20" />
                                                <p className="text-sm">No keyword data available for this selection</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Discovery Split */}
                            <Card className="bg-card/60 border-border/50 backdrop-blur-md shadow-sm transition-all hover:border-orange-500/20 flex flex-col">
                                <CardHeader>
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold">Discovery Type</CardTitle>
                                        <p className="text-xs text-muted-foreground font-medium">Business name vs categories</p>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-center space-y-8 pb-10 px-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Discovery</p>
                                                <p className="text-xs text-muted-foreground">Found via category/service</p>
                                            </div>
                                            <p className="text-3xl font-black text-[#f97316]">{discoverySplit.discoveryPct}%</p>
                                        </div>
                                        <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#f97316] rounded-full" style={{ width: `${discoverySplit.discoveryPct}%` }} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Branded</p>
                                                <p className="text-xs text-muted-foreground">Found via business name</p>
                                            </div>
                                            <p className="text-2xl font-black text-slate-500">{discoverySplit.directPct}%</p>
                                        </div>
                                        <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                                            <div className="h-full bg-slate-700 rounded-full" style={{ width: `${discoverySplit.directPct}%` }} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* 5. Platform Performance Table */}
                {platform === "all" && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Platform Comparison</h2>
                            <div className="h-[1px] flex-1 bg-border/30" />
                        </div>
                        <PlatformTable data={platformData} />
                    </div>
                )}
                    </>
                )}
            </div>
        </div>
    );
}
