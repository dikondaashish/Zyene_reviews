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
import { GoogleConnectEmptyState } from "@/components/dashboard/google-connect-empty-state";
import { GettingStartedBanner } from "@/components/dashboard/getting-started-banner";
import { DashboardTourOverlay } from "@/components/dashboard/dashboard-tour-overlay";
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
    const { business: activeBiz, organization, businesses: allBusinesses } = await getActiveBusinessId();

    const business = activeBiz || {
        id: null,
        total_reviews: 0,
        average_rating: 0,
        review_request_frequency_cap_days: 0,
        status: "inactive",
    };

    const totalOrgLimit = organization?.max_review_requests_per_month || 5000;
    const businessCount = Math.max(allBusinesses.length, 1);
    const maxRequestsPerMonth = Math.floor(totalOrgLimit / businessCount);

    const googlePlatform = (business as any)?.review_platforms?.find(
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

    // Getting started banner stats
    let customerCount = 0;
    let notificationsConfigured = false;

    if (business.id) {
        // ── Redis Caching ──
        const cacheKey = `dashboard:stats:${business.id}`;
        let cachedStats: any = null;
        try {
            const { redis } = await import('@/lib/redis');
            cachedStats = await redis.get(cacheKey);
        } catch (e) {
            console.error("Redis fetch error:", e);
        }

        if (cachedStats) {
            // Restore from cache
            const stats = typeof cachedStats === 'string' ? JSON.parse(cachedStats) : cachedStats;
            responseRate = stats.responseRate || 0;
            pendingCount = stats.pendingCount || 0;
            recentReviews = stats.recentReviews || [];
            attentionReviews = stats.attentionReviews || [];
            trendData = stats.trendData || [];
            ratingData = stats.ratingData || [];
            totalReviewsTrend = stats.totalReviewsTrend || 0;
            averageRatingTrend = stats.averageRatingTrend || 0;
            positivePercent = stats.positivePercent || 0;
            negativePercent = stats.negativePercent || 0;
            hasSentimentData = stats.hasSentimentData || false;
            engagementRate = stats.engagementRate || 0;
            hasEngagementData = stats.hasEngagementData || false;
            requestsThisMonth = stats.requestsThisMonth || 0;
            newReviews30d = stats.newReviews30d || 0;

            // Always fetch customer count and notification prefs (not cached)
            const [customerCountCached, notificationPrefsCached] = await Promise.all([
                supabase
                    .from("customers")
                    .select("*", { count: "exact", head: true })
                    .eq("business_id", business.id),
                supabase
                    .from("notification_preferences")
                    .select("*")
                    .eq("business_id", business.id)
                    .eq("user_id", user.id)
                    .limit(1),
            ]);
            customerCount = customerCountCached.count || 0;
            notificationsConfigured =
                (notificationPrefsCached.data &&
                notificationPrefsCached.data.length > 0 &&
                (notificationPrefsCached.data[0].email_enabled || notificationPrefsCached.data[0].sms_enabled)) || false;
        } else {
            // ── Precompute date boundaries (used by multiple queries) ──
            const now = new Date();
            const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // ── Fire ALL queries in parallel via Promise.all ──
            const [
                // Core stats
                respondedResult,
                pendingResult,
                recentResult,
                attentionResult,
                monthResult,
                trendResult,
                ratingResult,
                // Sentiment counts
                positiveResult,
                negMixedResult,
                sentimentTotalResult,
                // Engagement & usage
                completedRequestsResult,
                sentRequestsResult,
                monthlyRequestsResult,
                newReview30dResult,
                // Getting started banner
                customerCountResult,
                notificationPrefsResult,
            ] = await Promise.all([
                // 1. Response Rate
                supabase
                    .from("reviews")
                    .select("*", { count: "exact", head: true })
                    .eq("business_id", business.id)
                    .eq("response_status", "responded"),
                // 2. Pending Reviews Count
                supabase
                    .from("reviews")
                    .select("*", { count: "exact", head: true })
                    .eq("business_id", business.id)
                    .eq("response_status", "pending"),
                // 3. Recent Reviews (5 most recent)
                supabase
                    .from("reviews")
                    .select("*")
                    .eq("business_id", business.id)
                    .order("review_date", { ascending: false })
                    .limit(5),
                // 4. Needs Attention (urgent or negative, still pending)
                supabase
                    .from("reviews")
                    .select("*")
                    .eq("business_id", business.id)
                    .eq("response_status", "pending")
                    .or("rating.lte.2,urgency_score.gte.7")
                    .order("urgency_score", { ascending: false, nullsFirst: false })
                    .limit(5),
                // 5. Monthly trend data (since start of last month)
                supabase
                    .from("reviews")
                    .select("review_date, rating")
                    .eq("business_id", business.id)
                    .gte("review_date", startOfLastMonth.toISOString()),
                // 6. 30-day Chart Data
                supabase
                    .from("reviews")
                    .select("review_date")
                    .eq("business_id", business.id)
                    .gte("review_date", thirtyDaysAgo.toISOString()),
                // 7. Rating Distribution
                supabase
                    .from("reviews")
                    .select("rating")
                    .eq("business_id", business.id),
                // 8a. Positive sentiment count
                supabase
                    .from("reviews")
                    .select("*", { count: "exact", head: true })
                    .eq("business_id", business.id)
                    .eq("sentiment", "positive"),
                // 8b. Negative/mixed sentiment count
                supabase
                    .from("reviews")
                    .select("*", { count: "exact", head: true })
                    .eq("business_id", business.id)
                    .in("sentiment", ["negative", "mixed"]),
                // 8c. Total with sentiment
                supabase
                    .from("reviews")
                    .select("*", { count: "exact", head: true })
                    .eq("business_id", business.id)
                    .not("sentiment", "is", null),
                // 9a. Completed requests
                supabase
                    .from("review_requests")
                    .select("*", { count: "exact", head: true })
                    .eq("business_id", business.id)
                    .in("status", ["completed", "feedback_left"]),
                // 9b. Sent requests (non-queued)
                supabase
                    .from("review_requests")
                    .select("*", { count: "exact", head: true })
                    .eq("business_id", business.id)
                    .not("status", "eq", "queued"),
                // 10. Request usage this month
                supabase
                    .from("review_requests")
                    .select("*", { count: "exact", head: true })
                    .eq("business_id", business.id)
                    .gte("created_at", startOfThisMonth.toISOString()),
                // 11. New reviews (30 days)
                supabase
                    .from("reviews")
                    .select("*", { count: "exact", head: true })
                    .eq("business_id", business.id)
                    .gte("review_date", thirtyDaysAgo.toISOString()),
                // 12. Customer count (for getting started banner)
                supabase
                    .from("customers")
                    .select("*", { count: "exact", head: true })
                    .eq("business_id", business.id),
                // 13. Notification preferences (for getting started banner)
                supabase
                    .from("notification_preferences")
                    .select("*")
                    .eq("business_id", business.id)
                    .eq("user_id", user.id)
                    .limit(1),
            ]);

            // ── Process results ──

            // 1. Response Rate
            if (business.total_reviews > 0) {
                responseRate = ((respondedResult.count || 0) / business.total_reviews) * 100;
            }

            // 2. Pending
            pendingCount = pendingResult.count || 0;

            // 3. Recent
            recentReviews = recentResult.data || [];

            // 4. Attention
            attentionReviews = attentionResult.data || [];

            // 5. Monthly Trends
            const monthData = monthResult.data;
            if (monthData) {
                const thisMonthReviews = monthData.filter(r => new Date(r.review_date) >= startOfThisMonth);
                const lastMonthReviews = monthData.filter(r => new Date(r.review_date) < startOfThisMonth && new Date(r.review_date) >= startOfLastMonth);

                totalReviewsTrend = thisMonthReviews.length - lastMonthReviews.length;

                const thisMonthAvg = thisMonthReviews.length > 0
                    ? thisMonthReviews.reduce((sum, r) => sum + r.rating, 0) / thisMonthReviews.length
                    : 0;
                const lastMonthAvg = lastMonthReviews.length > 0
                    ? lastMonthReviews.reduce((sum, r) => sum + r.rating, 0) / lastMonthReviews.length
                    : 0;

                if (thisMonthAvg > 0 && lastMonthAvg > 0) {
                    averageRatingTrend = thisMonthAvg - lastMonthAvg;
                } else if (thisMonthAvg > 0) {
                    averageRatingTrend = thisMonthAvg;
                }
            }

            // 6. 30-day Chart
            const trendRaw = trendResult.data;
            if (trendRaw && trendRaw.length > 0) {
                const dayMap: Record<string, number> = {};
                trendRaw.forEach((r) => {
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
            const ratingRaw = ratingResult.data;
            if (ratingRaw && ratingRaw.length > 0) {
                const ratingMap: Record<number, number> = {};
                ratingRaw.forEach((r) => {
                    ratingMap[r.rating] = (ratingMap[r.rating] || 0) + 1;
                });
                ratingData = Object.entries(ratingMap).map(([rating, count]) => ({
                    rating: Number(rating),
                    count,
                }));
            }

            // 8. Sentiment
            const totalSentiment = sentimentTotalResult.count || 0;
            if (totalSentiment > 0) {
                hasSentimentData = true;
                positivePercent = ((positiveResult.count || 0) / totalSentiment) * 100;
                negativePercent = ((negMixedResult.count || 0) / totalSentiment) * 100;
            }

            // 9. Engagement
            if ((sentRequestsResult.count || 0) > 0) {
                hasEngagementData = true;
                engagementRate = ((completedRequestsResult.count || 0) / (sentRequestsResult.count || 1)) * 100;
            }

            // 10. Request Usage
            requestsThisMonth = monthlyRequestsResult.count || 0;

            // 11. New Reviews 30d
            newReviews30d = newReview30dResult.count || 0;

            // 12. Customer Count
            customerCount = customerCountResult.count || 0;

            // 13. Notification Preferences
            notificationsConfigured =
                (notificationPrefsResult.data &&
                notificationPrefsResult.data.length > 0 &&
                (notificationPrefsResult.data[0].email_enabled || notificationPrefsResult.data[0].sms_enabled)) || false;

            // Save to cache
            try {
                const statsToCache = { responseRate, pendingCount, recentReviews, attentionReviews, trendData, ratingData, totalReviewsTrend, averageRatingTrend, positivePercent, negativePercent, hasSentimentData, engagementRate, hasEngagementData, requestsThisMonth, newReviews30d };
                const { redis } = await import('@/lib/redis');
                await redis.set(cacheKey, JSON.stringify(statsToCache), { ex: 300 }); // 5 minutes TTL
            } catch (e) {
                console.error("Redis set error:", e);
            }
        } // Close cache miss `else`
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

            {/* Getting Started Banner */}
            {!organization?.onboarding_completed && (
                <GettingStartedBanner
                    googleConnected={isGoogleConnected}
                    customerCount={customerCount}
                    requestSent={requestsThisMonth > 0}
                    notificationsConfigured={notificationsConfigured}
                />
            )}

            {/* Tour Overlay */}
            <DashboardTourOverlay />

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-tour-target="tour-stats">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Reviews
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            {!isGoogleConnected && (
                                <div className="relative w-2 h-2">
                                    <div className="absolute inset-0 bg-orange-500 rounded-full animate-pulse"></div>
                                </div>
                            )}
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {business.total_reviews}
                        </div>
                        <p className={`text-xs mt-1 ${!isGoogleConnected ? "text-orange-600 font-medium" : "text-muted-foreground"}`}>
                            {!isGoogleConnected ? (
                                <span>📌 Connect Google to import your reviews</span>
                            ) : (
                                <>
                                    <span>From Google Reviews</span>
                                    {formatTrend(totalReviewsTrend) && <span className="ml-2">{formatTrend(totalReviewsTrend)}</span>}
                                </>
                            )}
                        </p>
                        {!isGoogleConnected && (
                            <Link href="/integrations">
                                <Button size="sm" className="mt-3 w-full" variant="outline">
                                    Connect Now →
                                </Button>
                            </Link>
                        )}
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
                        <div className={`text-2xl font-bold ${pendingCount === 0 ? "text-green-600" : ""}`}>
                            {pendingCount}
                        </div>
                        <p className={`text-xs mt-1 ${pendingCount === 0 ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
                            {pendingCount === 0
                                ? "No reviews waiting for a response. You're all caught up! ✓"
                                : `${pendingCount} awaiting response`
                            }
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
                    <CardContent data-tour-target="tour-recent-reviews">
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
                                    <GoogleConnectEmptyState />
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
                    <CardContent data-tour-target="tour-needs-attention">
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
