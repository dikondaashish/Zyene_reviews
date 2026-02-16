
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsFilters } from "@/components/analytics/analytics-filters";
import { RatingsChart } from "@/components/analytics/ratings-chart";
import { VolumeChart } from "@/components/analytics/volume-chart";
import { SentimentChart } from "@/components/analytics/sentiment-chart";
import { ThemeChart } from "@/components/analytics/theme-chart";
import { PlatformTable } from "@/components/analytics/platform-table";

// Helper to get start date
function getStartDate(range: string) {
    const now = new Date();
    switch (range) {
        case "7d": return new Date(now.setDate(now.getDate() - 7));
        case "30d": return new Date(now.setDate(now.getDate() - 30));
        case "90d": return new Date(now.setDate(now.getDate() - 90));
        case "12m": return new Date(now.setFullYear(now.getFullYear() - 1));
        default: return new Date(now.setDate(now.getDate() - 30));
    }
}

interface Review {
    created_at: string;
    rating: number | null;
    sentiment: string | null;
    themes: string[] | null;
    response_status: string | null;
    response_date: string | null;
}

export default async function AnalyticsPage({
    searchParams,
}: {
    searchParams: { range?: string };
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    const range = searchParams.range || "30d";
    const startDate = getStartDate(range);

    // 1. Fetch Reviews
    const { data: reviews } = await supabase
        .from("reviews")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

    // 2. Fetch Review Requests
    const { count: requestsCount } = await supabase
        .from("review_requests")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startDate.toISOString());

    const reviewList: Review[] = reviews || [];
    const totalReviews = reviewList.length;

    // --- Aggregations ---

    // Stats
    const totalRating = reviewList.reduce((acc: number, r: Review) => acc + (r.rating || 0), 0);
    const avgRating = totalReviews > 0 ? totalRating / totalReviews : 0;
    const respondedCount = reviewList.filter((r: Review) => r.response_status === "responded" || r.response_date).length;
    const responseRate = totalReviews > 0 ? (respondedCount / totalReviews) * 100 : 0;

    // Trend & Volume Data (Group by Date)
    const dateMap = new Map<string, { date: string; ratingSum: number; count: number; positive: number; neutral: number; negative: number }>();

    reviewList.forEach((r: Review) => {
        const date = new Date(r.created_at).toISOString().split('T')[0];
        if (!dateMap.has(date)) {
            dateMap.set(date, { date, ratingSum: 0, count: 0, positive: 0, neutral: 0, negative: 0 });
        }
        const entry = dateMap.get(date)!;
        entry.ratingSum += r.rating || 0;
        entry.count += 1;

        // Sentiment for bucket
        const rating = r.rating || 0;
        if (rating >= 4) entry.positive++;
        else if (rating === 3) entry.neutral++;
        else entry.negative++;
    });

    // Fill missing dates? For now, we'll just show days with data or linear if sparse. 
    // Ideally we fill gaps, but let's sort current map values.
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

    // Sentiment Chart Data
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0, mixed: 0 };
    reviewList.forEach((r: Review) => {
        const s = (r.sentiment || "").toLowerCase();
        if (s === "positive") sentimentCounts.positive++;
        else if (s === "negative") sentimentCounts.negative++;
        else if (s === "mixed") sentimentCounts.mixed++;
        else sentimentCounts.neutral++; // Default or 'neutral'
    });

    const sentimentData = [
        { name: "Positive", value: sentimentCounts.positive, color: "#22c55e" },
        { name: "Neutral", value: sentimentCounts.neutral, color: "#94a3b8" },
        { name: "Negative", value: sentimentCounts.negative, color: "#ef4444" },
        { name: "Mixed", value: sentimentCounts.mixed, color: "#eab308" },
    ].filter(d => d.value > 0);

    // Theme Analysis
    const themeMap = new Map<string, { count: number; sentimentScore: number }>();
    reviewList.forEach((r: Review) => {
        if (Array.isArray(r.themes)) {
            r.themes.forEach((t: string) => {
                const theme = t.toLowerCase();
                if (!themeMap.has(theme)) themeMap.set(theme, { count: 0, sentimentScore: 0 });
                const entry = themeMap.get(theme)!;
                entry.count++;
                // Simple score: +1 for 4-5 stars, -1 for 1-2 stars
                if (r.rating && r.rating >= 4) entry.sentimentScore++;
                if (r.rating && r.rating <= 2) entry.sentimentScore--;
            });
        }
    });

    const themeData = Array.from(themeMap.entries())
        .map(([theme, data]) => ({ theme, ...data }))
        .filter(t => t.count >= 2)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10

    // Platform Data (Placeholder for now, just Google)
    const platformData = [{
        platform: "google",
        reviews: totalReviews,
        avgRating: avgRating,
        responseRate: responseRate
    }];

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                <AnalyticsFilters />
            </div>

            {/* Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalReviews}</div>
                        <p className="text-xs text-muted-foreground">In selected period</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground">Based on {totalReviews} reviews</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{responseRate.toFixed(0)}%</div>
                        <p className="text-xs text-muted-foreground">{respondedCount} responded</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Requests Sent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{requestsCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Review invitations</p>
                    </CardContent>
                </Card>
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
    );
}

