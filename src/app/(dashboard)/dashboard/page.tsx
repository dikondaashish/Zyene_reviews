import { createClient } from "@/lib/supabase/server";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    BarChart3,
    MessageSquare,
    Star,
    Clock,
    AlertTriangle,
    ArrowRight,
    TrendingUp,
    CheckCircle,
    ThumbsUp,
    Target,
    Send,
    Calendar,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { GoogleConnectButton } from "@/components/dashboard/google-connect-button";
import { SyncButton } from "@/components/dashboard/sync-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ReviewTrendChart } from "@/components/dashboard/review-trend-chart";
import { RatingDistributionChart } from "@/components/dashboard/rating-distribution-chart";
import { QRCodeCard } from "@/components/dashboard/qr-code-card";
import { getActiveBusinessId } from "@/lib/business-context";

// Star rendering helper
function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-muted text-muted"
                        }`}
                />
            ))}
        </div>
    );
}

// Sentiment badge helper
function SentimentBadge({ sentiment }: { sentiment: string | null }) {
    if (!sentiment) return null;
    const colors: Record<string, string> = {
        positive: "bg-green-100 text-green-700",
        negative: "bg-red-100 text-red-700",
        neutral: "bg-gray-100 text-gray-700",
        mixed: "bg-yellow-100 text-yellow-700",
    };
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[sentiment] || colors.neutral
                }`}
        >
            {sentiment}
        </span>
    );
}

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get active business from context (cookie-based)
    const { business: activeBiz, organization } = await getActiveBusinessId();

    const business = activeBiz || {
        id: null,
        total_reviews: 0,
        average_rating: 0,
        review_request_frequency_cap_days: 0,
        status: "inactive",
    };

    const maxRequestsPerMonth = organization?.max_review_requests_per_month || 5000;

    // @ts-ignore
    const googlePlatform = business?.review_platforms?.find(
        (p: any) => p.platform === "google"
    );
    const isGoogleConnected = !!googlePlatform;
    const lastSynced = googlePlatform?.last_synced_at;

    // ── Real Data Queries ──────────────────────────────────────

    let responseRate = 0;
    let pendingCount = 0;
    let recentReviews: any[] = [];
    let attentionReviews: any[] = [];
    let trendData: { day: string; count: number }[] = [];
    let ratingData: { rating: number; count: number }[] = [];

    // Trend stats
    let totalReviewsTrend = 0;
    let averageRatingTrend = 0;

    // New stats
    let positivePercent = 0;
    let negativePercent = 0;
    let hasSentimentData = false;
    let engagementRate = 0;
    let hasEngagementData = false;
    let requestsThisMonth = 0;
    let newReviews30d = 0;

    if (business.id) {
        // 1. Response Rate
        const { count: respondedCount } = await supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .eq("response_status", "responded");

        if (business.total_reviews > 0) {
            responseRate = ((respondedCount || 0) / business.total_reviews) * 100;
        }

        // 2. Pending Reviews Count
        const { count } = await supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .eq("response_status", "pending");

        pendingCount = count || 0;

        // 3. Recent Reviews (5 most recent)
        const { data: recentData } = await supabase
            .from("reviews")
            .select("*")
            .eq("business_id", business.id)
            .order("review_date", { ascending: false })
            .limit(5);

        recentReviews = recentData || [];

        // 4. Needs Attention (urgent or negative, still pending)
        const { data: attentionData } = await supabase
            .from("reviews")
            .select("*")
            .eq("business_id", business.id)
            .eq("response_status", "pending")
            .or("rating.lte.2,urgency_score.gte.7")
            .order("urgency_score", { ascending: false, nullsFirst: false })
            .limit(5);

        attentionReviews = attentionData || [];

        // 5. Review Trend (last 30 days) AND Monthly Trends
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Fetch data for trends (since start of last month)
        const { data: monthData } = await supabase
            .from("reviews")
            .select("review_date, rating")
            .eq("business_id", business.id)
            .gte("review_date", startOfLastMonth.toISOString());

        if (monthData) {
            // Trend Indicators
            const thisMonthReviews = monthData.filter(r => new Date(r.review_date) >= startOfThisMonth);
            const lastMonthReviews = monthData.filter(r => new Date(r.review_date) < startOfThisMonth && new Date(r.review_date) >= startOfLastMonth);

            // Total Reviews Trend (diff count)
            totalReviewsTrend = thisMonthReviews.length - lastMonthReviews.length;

            // Average Rating Trend (diff avg)
            const thisMonthAvg = thisMonthReviews.length > 0
                ? thisMonthReviews.reduce((sum, r) => sum + r.rating, 0) / thisMonthReviews.length
                : 0;
            const lastMonthAvg = lastMonthReviews.length > 0
                ? lastMonthReviews.reduce((sum, r) => sum + r.rating, 0) / lastMonthReviews.length
                : 0;

            // Only calculate trend if we have data for both or at least this month
            if (thisMonthAvg > 0 && lastMonthAvg > 0) {
                averageRatingTrend = thisMonthAvg - lastMonthAvg;
            } else if (thisMonthAvg > 0) {
                averageRatingTrend = thisMonthAvg; // Accession
            }
        }

        // 6. 30-day Chart Data
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: trendRaw } = await supabase
            .from("reviews")
            .select("review_date")
            .eq("business_id", business.id)
            .gte("review_date", thirtyDaysAgo.toISOString());

        if (trendRaw && trendRaw.length > 0) {
            const dayMap: Record<string, number> = {};
            trendRaw.forEach((r: any) => {
                const day = new Date(r.review_date).toISOString().split("T")[0];
                dayMap[day] = (dayMap[day] || 0) + 1;
            });
            for (let i = 0; i < 30; i++) {
                const d = new Date();
                d.setDate(d.getDate() - (29 - i));
                const key = d.toISOString().split("T")[0];
                if (!dayMap[key]) dayMap[key] = 0;
            }
            trendData = Object.entries(dayMap)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([day, count]) => ({ day, count }));
        }

        // 7. Rating Distribution
        const { data: ratingRaw } = await supabase
            .from("reviews")
            .select("rating")
            .eq("business_id", business.id);

        if (ratingRaw && ratingRaw.length > 0) {
            const ratingMap: Record<number, number> = {};
            ratingRaw.forEach((r: any) => {
                ratingMap[r.rating] = (ratingMap[r.rating] || 0) + 1;
            });
            ratingData = Object.entries(ratingMap).map(([rating, count]) => ({
                rating: Number(rating),
                count,
            }));
        }

        // 8. Positive / Negative Experience %
        const { count: positiveCount } = await supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .eq("sentiment", "positive");

        const { count: negMixedCount } = await supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .in("sentiment", ["negative", "mixed"]);

        const { count: sentimentTotalCount } = await supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .not("sentiment", "is", null);

        const totalSentiment = sentimentTotalCount || 0;
        if (totalSentiment > 0) {
            hasSentimentData = true;
            positivePercent = ((positiveCount || 0) / totalSentiment) * 100;
            negativePercent = ((negMixedCount || 0) / totalSentiment) * 100;
        }

        // 9. Engagement Rate
        const { count: completedRequests } = await supabase
            .from("review_requests")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .in("status", ["completed", "feedback_left"]);

        const { count: sentRequests } = await supabase
            .from("review_requests")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .not("status", "eq", "queued");

        if ((sentRequests || 0) > 0) {
            hasEngagementData = true;
            engagementRate = ((completedRequests || 0) / (sentRequests || 1)) * 100;
        }

        // 10. Request Usage This Month
        const now2 = new Date();
        const firstOfMonth = new Date(now2.getFullYear(), now2.getMonth(), 1);
        const { count: monthlyRequests } = await supabase
            .from("review_requests")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .gte("created_at", firstOfMonth.toISOString());

        requestsThisMonth = monthlyRequests || 0;

        // 11. New Reviews (30 days)
        const thirtyDaysAgo2 = new Date();
        thirtyDaysAgo2.setDate(thirtyDaysAgo2.getDate() - 30);
        const { count: newReviewCount } = await supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .gte("review_date", thirtyDaysAgo2.toISOString());

        newReviews30d = newReviewCount || 0;
    }

    // ── Computed Stats ──────────────────────────────────────────

    const responseRateLabel =
        business.total_reviews > 0
            ? `${responseRate.toFixed(1)}% of reviews responded`
            : "No reviews yet";

    const pendingLabel =
        pendingCount > 0
            ? `${pendingCount} awaiting response`
            : "All caught up!";

    const formatTrend = (val: number, isRating = false) => {
        if (val === 0) return null;
        const isPositive = val > 0;
        const text = isRating ? val.toFixed(1) : Math.abs(val);
        // For reviews: more is good (green). For ratings: higher is good (green).
        const color = isPositive ? "text-green-600" : "text-red-600";
        const Icon = isPositive ? TrendingUp : TrendingUp; // Could use TrendingDown for negative but lucide TrendingUp rotated is fine or specific icons

        return (
            <span className={`text-xs font-medium ${color} flex items-center`}>
                {isPositive ? "+" : "-"}{text}
                {isRating ? " stars" : ""}
                {isPositive ? " this month" : " vs last month"}
            </span>
        );
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Dashboard
                    </h1>
                    {lastSynced && (
                        <p className="text-sm text-muted-foreground">
                            Last synced:{" "}
                            {formatDistanceToNow(new Date(lastSynced), {
                                addSuffix: true,
                            })}
                        </p>
                    )}
                </div>
                {isGoogleConnected && <SyncButton />}
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Reviews
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {business.total_reviews}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                            <span>From Google Reviews</span>
                            {formatTrend(totalReviewsTrend)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Average Rating
                        </CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Number(business.average_rating).toFixed(1)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                            <span>Based on Google</span>
                            {formatTrend(averageRatingTrend, true)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Response Rate
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{responseRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {responseRateLabel}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending Reviews
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {pendingLabel}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Extended Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Positive Experience % */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Positive Experience
                        </CardTitle>
                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${!hasSentimentData ? "text-muted-foreground" :
                            positivePercent > 60 ? "text-green-600" :
                                positivePercent >= 40 ? "text-yellow-600" :
                                    "text-red-600"
                            }`}>
                            {hasSentimentData ? `${positivePercent.toFixed(0)}%` : "—"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {hasSentimentData
                                ? `${negativePercent.toFixed(0)}% negative/mixed`
                                : "No sentiment data yet"}
                        </p>
                    </CardContent>
                </Card>

                {/* Engagement Rate */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Engagement Rate
                        </CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${!hasEngagementData ? "text-muted-foreground" : ""
                            }`}>
                            {hasEngagementData ? `${engagementRate.toFixed(1)}%` : "—"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {hasEngagementData
                                ? "Completed the review flow"
                                : "No requests sent yet"}
                        </p>
                    </CardContent>
                </Card>

                {/* Request Usage */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Request Usage
                        </CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${(requestsThisMonth / maxRequestsPerMonth) > 0.95 ? "text-red-600" :
                            (requestsThisMonth / maxRequestsPerMonth) > 0.8 ? "text-yellow-600" : ""
                            }`}>
                            {requestsThisMonth} / {maxRequestsPerMonth}
                        </div>
                        <Progress
                            value={Math.min((requestsThisMonth / maxRequestsPerMonth) * 100, 100)}
                            className="mt-2 h-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            This month&apos;s plan usage
                        </p>
                    </CardContent>
                </Card>

                {/* New Reviews (30 days) */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            New Reviews (30d)
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {newReviews30d}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Reviews in last 30 days
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Review Trend
                        </CardTitle>
                        <CardDescription>
                            Reviews received over the last 30 days
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ReviewTrendChart data={trendData} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Rating Distribution
                        </CardTitle>
                        <CardDescription>
                            Breakdown of all review ratings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RatingDistributionChart data={ratingData} />
                    </CardContent>
                </Card>
            </div>

            {/* QR Code Card */}
            {business.slug && (
                <QRCodeCard
                    businessId={business.id}
                    businessSlug={business.slug}
                    businessName={business.name || "Business"}
                />
            )}

            {/* Bottom Row: Recent Reviews + Needs Attention */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Recent Reviews */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Reviews</CardTitle>
                            <CardDescription>
                                Latest reviews from your customers
                            </CardDescription>
                        </div>
                        {recentReviews.length > 0 && (
                            <Link href="/reviews">
                                <Button variant="ghost" size="sm" className="gap-1">
                                    View all <ArrowRight className="h-3 w-3" />
                                </Button>
                            </Link>
                        )}
                    </CardHeader>
                    <CardContent>
                        {recentReviews.length > 0 ? (
                            <div className="space-y-4">
                                {recentReviews.map((review: any) => (
                                    <div
                                        key={review.id}
                                        className="flex flex-col gap-1.5 border-b border-border/50 pb-3 last:border-0 last:pb-0"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">
                                                    {review.author_name || "Anonymous"}
                                                </span>
                                                <SentimentBadge
                                                    sentiment={review.sentiment}
                                                />
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {review.review_date
                                                    ? formatDistanceToNow(
                                                        new Date(review.review_date),
                                                        { addSuffix: true }
                                                    )
                                                    : ""}
                                            </span>
                                        </div>
                                        <Stars rating={review.rating} />
                                        {review.text && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {review.text}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={
                                                    review.response_status === "responded"
                                                        ? "default"
                                                        : review.response_status === "pending"
                                                            ? "secondary"
                                                            : "outline"
                                                }
                                                className="text-xs"
                                            >
                                                {review.response_status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                                {isGoogleConnected ? (
                                    <>
                                        <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
                                        <p className="text-muted-foreground">
                                            No reviews synced yet. Hit sync to
                                            pull your latest reviews.
                                        </p>
                                        <SyncButton />
                                    </>
                                ) : (
                                    <>
                                        <p className="text-muted-foreground">
                                            Connect Google to see your reviews.
                                        </p>
                                        <GoogleConnectButton
                                            isConnected={false}
                                        />
                                    </>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Needs Attention */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                Needs Attention
                            </CardTitle>
                            <CardDescription>
                                Urgent or negative reviews awaiting response
                            </CardDescription>
                        </div>
                        {attentionReviews.length > 0 && (
                            <Link href="/reviews?status=needs_response&sort=lowest">
                                <Button variant="ghost" size="sm" className="gap-1">
                                    View all <ArrowRight className="h-3 w-3" />
                                </Button>
                            </Link>
                        )}
                    </CardHeader>
                    <CardContent>
                        {attentionReviews.length > 0 ? (
                            <div className="space-y-4">
                                {attentionReviews.map((review: any) => (
                                    <div
                                        key={review.id}
                                        className="flex flex-col gap-1.5 border-b border-border/50 pb-3 last:border-0 last:pb-0"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">
                                                    {review.author_name || "Anonymous"}
                                                </span>
                                                {review.urgency_score >= 7 && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="text-xs"
                                                    >
                                                        Urgency: {review.urgency_score}
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {review.review_date
                                                    ? formatDistanceToNow(
                                                        new Date(review.review_date),
                                                        { addSuffix: true }
                                                    )
                                                    : ""}
                                            </span>
                                        </div>
                                        <Stars rating={review.rating} />
                                        {review.text && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {review.text}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                                <div className="rounded-full bg-green-50 p-3">
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                </div>
                                <p className="font-medium text-sm">
                                    All clear!
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    No urgent reviews need your attention right
                                    now.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
