import { createClient } from "@/lib/db/supabase/server";
import { cookies } from "next/headers";
import { getDictionary } from "@/lib/i18n/dictionaries";
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
    Sparkles,
    Trophy,
    Eye,
    Phone,
    Navigation2,
    MousePointerClick,
    HelpCircle,
    Link2,
    ListChecks,
    BedDouble,
} from "lucide-react";
import { MilestoneCelebration } from "@/components/dashboard/milestone-celebration";
import { DemoModeBanner } from "@/components/dashboard/demo-mode-banner";
import { Progress } from "@/components/ui/progress";
import { GoogleConnectButton } from "@/components/dashboard/google-connect-button";
import { SyncButton } from "@/components/dashboard/sync-button";
import { GoogleConnectEmptyState } from "@/components/dashboard/google-connect-empty-state";
import { GettingStartedBanner } from "@/components/dashboard/getting-started-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ReviewTrendChart } from "@/components/dashboard/review-trend-chart";
import { RatingDistributionChart } from "@/components/dashboard/rating-distribution-chart";
import { QRCodeCard } from "@/components/dashboard/qr-code-card";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { DASHBOARD_DEMO_DATA } from "@/constants/dashboard-demo-data";
import {
    dateRangeLastNDays,
    getGooglePerformanceTotals,
    type GooglePerformanceTotals,
} from "@/services/google/performance-queries";
import { ProStatCard } from "@/components/dashboard/pro-stat-card";
import { AnimatedReviewCards } from "@/components/ui/animated-review-card";

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
    const cookieStore = await cookies();
    const localeVal = cookieStore.get('locale')?.value || 'en';
    const dict = getDictionary(localeVal);

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

    // Determine plan status
    const planStatus = organization?.plan_status || "inactive";
    const isPaidPlan = planStatus === "active" || planStatus === "trialing";

    // If no plan, set limit to 0 (user request)
    const totalOrgLimit = isPaidPlan ? (organization?.max_review_requests_per_month || 5000) : 0;
    const businessCount = Math.max(allBusinesses.length, 1);
    const maxRequestsPerMonth = totalOrgLimit > 0 ? Math.floor(totalOrgLimit / businessCount) : 0;

    const googlePlatform = (business as any)?.review_platforms?.find(
        (p: any) => p.platform === "google"
    );
    const isGoogleConnected = !!googlePlatform;
    const lastSynced = googlePlatform?.last_synced_at;

    let googlePerf: GooglePerformanceTotals | null = null;
    let perfSyncedAt: string | null = null;

    // ── Demo Data Injection ───────────────────────────────────
    const useDemoData = !isGoogleConnected;

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

    let unansweredQaCount = 0;
    let brokenPlaceLinksCount = 0;

    if (business.id) {
        // ── Redis Caching ──
        const cacheKey = `dashboard:stats:${business.id}`;
        let cachedStats: any = null;
        try {
            const { redis } = await import('@/lib/db/redis');
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
            const monthData = (monthResult.data || []) as Array<{
                review_date: string;
                rating: number;
            }>;
            if (monthData) {
                const thisMonthReviews = monthData.filter((r) => new Date(r.review_date) >= startOfThisMonth);
                const lastMonthReviews = monthData.filter((r) => new Date(r.review_date) < startOfThisMonth && new Date(r.review_date) >= startOfLastMonth);

                totalReviewsTrend = thisMonthReviews.length - lastMonthReviews.length;

                const thisMonthAvg = thisMonthReviews.length > 0
                    ? thisMonthReviews.reduce((sum: number, r) => sum + r.rating, 0) / thisMonthReviews.length
                    : 0;
                const lastMonthAvg = lastMonthReviews.length > 0
                    ? lastMonthReviews.reduce((sum: number, r) => sum + r.rating, 0) / lastMonthReviews.length
                    : 0;

                if (thisMonthAvg > 0 && lastMonthAvg > 0) {
                    averageRatingTrend = thisMonthAvg - lastMonthAvg;
                } else if (thisMonthAvg > 0) {
                    averageRatingTrend = thisMonthAvg;
                }
            }

            // 6. 30-day Chart
            const trendRaw = (trendResult.data || []) as Array<{ review_date: string }>;
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
            const ratingRaw = (ratingResult.data || []) as Array<{ rating: number }>;
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
                const { redis } = await import('@/lib/db/redis');
                await redis.set(cacheKey, JSON.stringify(statsToCache), { ex: 300 }); // 5 minutes TTL
            } catch (e) {
                console.error("Redis set error:", e);
            }
        } // Close cache miss `else`
    }

    if (!useDemoData && business.id && isGoogleConnected) {
        const [qaRes, plRes] = await Promise.all([
            supabase
                .from("gbp_questions")
                .select("*", { count: "exact", head: true })
                .eq("business_id", business.id)
                .eq("has_merchant_answer", false),
            supabase
                .from("gbp_place_action_links")
                .select("*", { count: "exact", head: true })
                .eq("business_id", business.id)
                .eq("is_broken", true),
        ]);
        unansweredQaCount = qaRes.count ?? 0;
        brokenPlaceLinksCount = plRes.count ?? 0;
    }

    // ── Computed Stats ──────────────────────────────────────────

    const responseRateLabel =
        business.total_reviews > 0
            ? `${responseRate.toFixed(1)}${dict.dashboard.reviews_responded}`
            : dict.dashboard.no_reviews;

    const pendingLabel =
        pendingCount > 0
            ? `${pendingCount} ${dict.dashboard.awaiting_response}`
            : dict.dashboard.all_caught_up;

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

    if (useDemoData) {
        responseRate = DASHBOARD_DEMO_DATA.responseRate;
        pendingCount = DASHBOARD_DEMO_DATA.pendingCount;
        recentReviews = [...DASHBOARD_DEMO_DATA.recentReviews];
        trendData = [...DASHBOARD_DEMO_DATA.trendData];
        ratingData = [...DASHBOARD_DEMO_DATA.ratingData];
        positivePercent = DASHBOARD_DEMO_DATA.positivePercent;
        negativePercent = DASHBOARD_DEMO_DATA.negativePercent;
        hasSentimentData = true;
        engagementRate = DASHBOARD_DEMO_DATA.engagementRate;
        hasEngagementData = true;
        newReviews30d = DASHBOARD_DEMO_DATA.newReviews30d;
        
        // Mock business stats for cards
        (business as any).total_reviews = DASHBOARD_DEMO_DATA.total_reviews;
        (business as any).average_rating = DASHBOARD_DEMO_DATA.average_rating;
        googlePerf = {
            profileViews: 3421,
            callClicks: 89,
            directionRequests: 156,
            websiteClicks: 234,
            rawRowCount: 120,
        };
        perfSyncedAt = new Date().toISOString();
        unansweredQaCount = 3;
        brokenPlaceLinksCount = 1;
    }

    let googleLodgingHealthScore: number | null = null;
    let googleLodgingApplicable: boolean | null = null;
    if (useDemoData) {
        googleLodgingHealthScore = 68;
        googleLodgingApplicable = true;
    } else if (isGoogleConnected) {
        const gp = googlePlatform as {
            google_lodging_health_score?: number | null;
            google_lodging_available?: boolean | null;
        };
        googleLodgingApplicable = typeof gp.google_lodging_available === "boolean" ? gp.google_lodging_available : null;
        googleLodgingHealthScore =
            typeof gp.google_lodging_health_score === "number" ? gp.google_lodging_health_score : null;
    }

    if (!useDemoData && business.id && isGoogleConnected) {
        const { start, end } = dateRangeLastNDays(30);
        googlePerf = await getGooglePerformanceTotals(supabase, business.id, start, end);
        perfSyncedAt =
            (googlePlatform as { google_performance_synced_at?: string | null })
                ?.google_performance_synced_at ?? null;
    }

    let googleProfileHealthScore: number | null = null;
    if (useDemoData) {
        googleProfileHealthScore = 72;
    } else if (isGoogleConnected) {
        const gh = (googlePlatform as { google_profile_health_score?: number | null })
            ?.google_profile_health_score;
        googleProfileHealthScore = typeof gh === "number" ? gh : null;
    }

    const reviewsCount = business.total_reviews;

    return (
        <div className="flex flex-col gap-6 w-full">
            <MilestoneCelebration currentCount={reviewsCount} type="reviews" isDemo={useDemoData} scopeKey={business.id} />
            
            {/* Demo Mode Banner */}
            {useDemoData && <DemoModeBanner className="mb-2" />}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {dict.dashboard.title}
                        </h1>
                        {useDemoData && (
                            <Badge variant="outline" className="border-indigo-200 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/50 flex items-center gap-1 px-2.5 py-0.5">
                                <Sparkles className="w-3 h-3" />
                                {dict.dashboard.demo_badge}
                            </Badge>
                        )}
                    </div>
                    {lastSynced && (
                        <p className="text-sm text-muted-foreground">
                            {dict.dashboard.last_synced}
                            {formatDistanceToNow(new Date(lastSynced), {
                                addSuffix: true,
                            })}
                            {perfSyncedAt && (
                                <>
                                    {" "}
                                    · {dict.dashboard.google_metrics}
                                    {formatDistanceToNow(new Date(perfSyncedAt), {
                                        addSuffix: true,
                                    })}
                                </>
                            )}
                        </p>
                    )}
                </div>
                {isGoogleConnected && <SyncButton />}
            </div>

            {/* Getting Started Banner - Persists until all tasks are done or dismissed */}
            {(!organization?.onboarding_completed || !isGoogleConnected || customerCount === 0 || !notificationsConfigured) && (
                <GettingStartedBanner
                    googleConnected={isGoogleConnected}
                    customerCount={customerCount}
                    requestSent={requestsThisMonth > 0}
                    notificationsConfigured={notificationsConfigured}
                />
            )}

            {/* QR Code Card */}
            {business.slug && (
                <QRCodeCard
                    businessId={business.id}
                    businessSlug={business.slug}
                    businessName={business.name || "Business"}
                />
            )}

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" data-tour-target="tour-stats">
                <ProStatCard
                    title={dict.dashboard.total_reviews}
                    value={business.total_reviews}
                    iconName="reviews"
                    description={!isGoogleConnected ? dict.dashboard.connect_google : dict.dashboard.from_google}
                    trend={totalReviewsTrend}
                    trendLabel={dict.dashboard.vs_last_month}
                    delay={0.1}
                />
                <ProStatCard
                    title={dict.dashboard.average_rating}
                    value={Number(business.average_rating)}
                    iconName="rating"
                    precision={1}
                    description={dict.dashboard.based_on_google}
                    trend={Math.round(averageRatingTrend * 10)}
                    trendLabel={dict.dashboard.pts}
                    delay={0.2}
                />
                <ProStatCard
                    title={dict.dashboard.response_rate}
                    value={responseRate}
                    iconName="response"
                    suffix="%"
                    precision={1}
                    description={responseRateLabel}
                    delay={0.3}
                />
                <ProStatCard
                    title={dict.dashboard.pending_reviews}
                    value={pendingCount}
                    iconName="pending"
                    description={pendingCount === 0 ? dict.dashboard.all_caught_up : dict.dashboard.awaiting_response}
                    className={pendingCount === 0 ? "border-green-500/20 bg-green-500/5" : ""}
                    delay={0.4}
                />
            </div>

            {(isGoogleConnected || useDemoData) && (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{dict.dashboard.unanswered_qa}</CardTitle>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`text-2xl font-bold ${
                                    unansweredQaCount === 0 ? "text-green-600" : "text-amber-600"
                                }`}
                            >
                                {unansweredQaCount}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {dict.dashboard.qa_desc}
                            </p>
                            <Link href="/questions" className="mt-3 inline-block">
                                <Button variant="outline" size="sm">
                                    {dict.dashboard.manage_qa}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{dict.dashboard.broken_links}</CardTitle>
                            <Link2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`text-2xl font-bold ${
                                    brokenPlaceLinksCount === 0 ? "text-green-600" : "text-red-600"
                                }`}
                            >
                                {brokenPlaceLinksCount}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {dict.dashboard.links_desc}
                            </p>
                            <Link href="/settings/business-information" className="mt-3 inline-block">
                                <Button variant="outline" size="sm">
                                    {dict.dashboard.manage_links}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{dict.dashboard.listing_completeness}</CardTitle>
                            <ListChecks className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`text-2xl font-bold ${
                                    googleProfileHealthScore === null
                                        ? "text-muted-foreground"
                                        : googleProfileHealthScore >= 80
                                          ? "text-green-600"
                                          : googleProfileHealthScore >= 40
                                            ? "text-amber-600"
                                            : "text-red-600"
                                }`}
                            >
                                {googleProfileHealthScore !== null ? `${googleProfileHealthScore}` : "—"}
                                {googleProfileHealthScore !== null && (
                                    <span className="text-lg font-semibold text-muted-foreground">/100</span>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {dict.dashboard.listing_desc}
                            </p>
                            <Link href="/settings/business-information" className="mt-3 inline-block">
                                <Button variant="outline" size="sm">
                                    {dict.dashboard.edit_listing}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{dict.dashboard.lodging_completeness}</CardTitle>
                            <BedDouble className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {googleLodgingApplicable === false ? (
                                <>
                                    <div className="text-2xl font-bold text-muted-foreground">—</div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {dict.dashboard.not_hotel}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div
                                        className={`text-2xl font-bold ${
                                            googleLodgingHealthScore === null
                                                ? "text-muted-foreground"
                                                : googleLodgingHealthScore >= 80
                                                  ? "text-green-600"
                                                  : googleLodgingHealthScore >= 40
                                                    ? "text-amber-600"
                                                    : "text-red-600"
                                        }`}
                                    >
                                        {googleLodgingHealthScore !== null ? `${googleLodgingHealthScore}` : "—"}
                                        {googleLodgingHealthScore !== null && (
                                            <span className="text-lg font-semibold text-muted-foreground">/100</span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {googleLodgingHealthScore === null && googleLodgingApplicable === null
                                            ? dict.dashboard.lodging_desc_empty
                                            : dict.dashboard.lodging_desc}
                                    </p>
                                </>
                            )}
                            <Link href="/settings/business-information" className="mt-3 inline-block">
                                <Button variant="outline" size="sm">
                                    {dict.dashboard.lodging_details}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Google Business Profile performance (last 30 days) */}
            {(useDemoData || isGoogleConnected) && googlePerf && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Google listing performance
                        </h2>
                        <span className="text-xs text-muted-foreground">Last 30 days</span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Profile views</CardTitle>
                                <Eye className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {googlePerf.profileViews.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Search + Maps impressions
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Phone calls</CardTitle>
                                <Phone className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {googlePerf.callClicks.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Call button taps</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Direction requests</CardTitle>
                                <Navigation2 className="h-4 w-4 text-violet-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {googlePerf.directionRequests.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Route opens</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{dict.dashboard.website_clicks}</CardTitle>
                                <MousePointerClick className="h-4 w-4 text-orange-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {googlePerf.websiteClicks.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{dict.dashboard.website_clicks_desc}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Extended Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Positive Experience % */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {dict.dashboard.positive_experience}
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
                                ? `${negativePercent.toFixed(0)}% ${dict.dashboard.negative_mixed}`
                                : dict.dashboard.no_sentiment_data}
                        </p>
                    </CardContent>
                </Card>

                {/* Engagement Rate */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {dict.dashboard.engagement_rate}
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
                                ? dict.dashboard.engagement_desc
                                : dict.dashboard.no_engagement_data}
                        </p>
                    </CardContent>
                </Card>

                {/* Request Usage */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {dict.dashboard.usage_title}
                        </CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className={`text-2xl font-bold ${maxRequestsPerMonth > 0 && (requestsThisMonth / maxRequestsPerMonth) > 0.95 ? "text-red-600" :
                                maxRequestsPerMonth > 0 && (requestsThisMonth / maxRequestsPerMonth) > 0.8 ? "text-yellow-600" : ""
                                }`}>
                                {requestsThisMonth} / {maxRequestsPerMonth}
                            </div>
                            {!isPaidPlan && (
                                <Link href="/settings/billing">
                                    <Button variant="outline" size="sm" className="h-7 text-xs border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800">
                                        <Sparkles className="mr-1 h-3 w-3" />
                                        {dict.dashboard.upgrade_prompt || "Upgrade"}
                                    </Button>
                                </Link>
                            )}
                        </div>
                        <Progress
                            value={maxRequestsPerMonth > 0 ? Math.min((requestsThisMonth / maxRequestsPerMonth) * 100, 100) : 0}
                            className="mt-2 h-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {dict.dashboard.usage_desc}
                        </p>
                    </CardContent>
                </Card>

                {/* New Reviews (30 days) */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {dict.dashboard.new_reviews_30d}
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {newReviews30d}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {dict.dashboard.new_reviews_30d_desc}
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
                            {dict.dashboard.review_trend}
                        </CardTitle>
                        <CardDescription>
                            {dict.dashboard.review_trend_desc}
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
                            {dict.dashboard.rating_distribution}
                        </CardTitle>
                        <CardDescription>
                            {dict.dashboard.rating_distribution_desc}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RatingDistributionChart data={ratingData} />
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row: Recent Reviews + Needs Attention */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Spotlight Reviews */}
                <Card className="overflow-hidden border-none bg-transparent shadow-none">
                    <CardHeader className="px-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    Review Spotlight
                                </CardTitle>
                                <CardDescription>
                                    Interactive view of your latest feedback
                                </CardDescription>
                            </div>
                            <Link href="/reviews">
                                <Button variant="ghost" size="sm" className="gap-1">
                                    Manage all <ArrowRight className="h-3 w-3" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="px-0 relative">
                        {recentReviews.length > 0 ? (
                            <div className="py-4">
                                <AnimatedReviewCards 
                                    reviews={recentReviews.map((r: any) => ({
                                        id: r.id,
                                        name: r.author_name || "Anonymous",
                                        avatar: r.author_photo_url || "",
                                        text: r.text || "No review content provided.",
                                        rating: r.rating
                                    }))}
                                    theme="default"
                                    interactionType="drag"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-card/30 rounded-2xl border border-dashed border-border">
                                <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-4" />
                                <p className="text-muted-foreground text-sm">No reviews to spotlight yet</p>
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
