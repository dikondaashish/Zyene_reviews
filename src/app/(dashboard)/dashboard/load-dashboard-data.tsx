import { createClient } from "@/lib/db/supabase/server";
import { fetchAllReviewRowsPaginated } from "@/lib/reviews/fetch-reviews-paginated";
import { redirect } from "next/navigation";
import { TrendingUp } from "lucide-react";
import { getActiveBusinessId, getGoogleQaUnavailableForActiveBusiness } from "@/lib/auth/business-context";
import { planAllowsAiReviewFeatures } from "@/services/stripe/plans";
import { DASHBOARD_DEMO_DATA } from "@/constants/dashboard-demo-data";
import {
    dateRangeLastNDays,
    getGooglePerformanceTotals,
    type GooglePerformanceTotals,
} from "@/services/google/performance-queries";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import {
    fetchVisibleReviewRollupsByBusinessIds,
    type VisibleReviewRollup,
} from "@/lib/reviews/visible-review-rollups";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { computeYtdReviewTrends } from "./helpers";
import type {
    BusinessExtended,
    DashboardCachedStats,
    LoadDashboardPageDataResult,
    RawReviewRow,
    ReviewPlatformRow,
} from "./types";

export async function loadDashboardPageData(dict: Dictionary): Promise<LoadDashboardPageDataResult> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get active business from context (cookie-based)
    const { business: activeBiz, organization, businesses: allBusinesses } = await getActiveBusinessId();

    const business = (activeBiz || {
        id: "",
        name: "Your Business",
        slug: "",
        status: "inactive",
        total_reviews: 0,
        average_rating: 0,
        review_request_frequency_cap_days: 0,
    }) as BusinessExtended;

    // Determine plan status
    const planStatus = organization?.plan_status || "inactive";
    const isPaidPlan = (planStatus === "active" || planStatus === "trialing") && organization?.plan !== "none";
    const planAllowsAiReplies = planAllowsAiReviewFeatures(
        organization?.plan ?? null,
        (organization as { plan_status?: string | null } | null)?.plan_status ?? null,
    );

    // If no plan, set limit to 0 (user request)
    const totalOrgLimit = isPaidPlan ? (organization?.max_review_requests_per_month || 5000) : 0;
    const businessCount = Math.max(allBusinesses.length, 1);
    const maxRequestsPerMonth = Math.floor(totalOrgLimit / businessCount);

    const googlePlatform = business.review_platforms?.find(
        (p: ReviewPlatformRow) => p.platform === "google"
    );
    const isGoogleConnected = !!googlePlatform;
    const lastSynced = googlePlatform?.last_synced_at;
    const googleQaUnavailable = business.id
        ? await getGoogleQaUnavailableForActiveBusiness(business.id)
        : false;

    let googlePerf: GooglePerformanceTotals | null = null;
    let perfSyncedAt: string | null = null;

    // ── Demo Data Injection ───────────────────────────────────
    const useDemoData = !isGoogleConnected;

    /** Hide Q&A metrics when Google returned no Q&A for this listing (see review_platforms.google_qa_unavailable). */
    const showUnansweredQaCard =
        (isGoogleConnected || useDemoData) && (!isGoogleConnected || !googleQaUnavailable);

    // ── Real Data Queries ──────────────────────────────────────

    let responseRate = 0;
    let pendingCount = 0;
    let recentReviews: RawReviewRow[] = [];
    let attentionReviews: RawReviewRow[] = [];
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

    /** Live counts from `reviews` (is_visible). Cards used `businesses.total_reviews` / `average_rating` (denormalized; can match Google headline ~1000). */
    let visibleReviewRollup: VisibleReviewRollup | null = null;
    if (business.id && !useDemoData) {
        const rollupMap = await fetchVisibleReviewRollupsByBusinessIds(supabase, [business.id]);
        visibleReviewRollup = rollupMap.get(business.id) ?? null;
    }

    if (business.id) {
        // ── Redis Caching ──
        const cacheKey = `dashboard:stats:${business.id}`;
        let cachedStatsRaw: unknown = null;
        try {
            const { redis } = await import('@/lib/db/redis');
            cachedStatsRaw = await redis.get(cacheKey);
        } catch (e) {
            console.error("Redis fetch error:", e);
        }

        if (cachedStatsRaw) {
            // Restore from cache
            const stats = (typeof cachedStatsRaw === 'string' ? JSON.parse(cachedStatsRaw) : cachedStatsRaw) as DashboardCachedStats;
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

            if (!useDemoData && visibleReviewRollup) {
                pendingCount = visibleReviewRollup.pendingVisible;
                const { count: respondedVisible, error: respondedVisibleErr } = await supabase
                    .from("reviews")
                    .select("*", { count: "exact", head: true })
                    .eq("business_id", business.id)
                    .eq("is_visible", true)
                    .eq("response_status", "responded");
                if (respondedVisibleErr) {
                    console.error("[Dashboard page] Visible responded count failed:", respondedVisibleErr);
                } else {
                    responseRate =
                        visibleReviewRollup.totalVisible > 0
                            ? ((respondedVisible ?? 0) / visibleReviewRollup.totalVisible) * 100
                            : 0;
                }
            }

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
            if (customerCountCached.error || notificationPrefsCached.error) {
                console.error("[Dashboard page] Cached branch fetch failed:", customerCountCached.error || notificationPrefsCached.error);
                return {
                    errorElement: (
                        <DashboardFetchError
                            message="We could not load dashboard stats for this business. Check your connection and try again."
                            retryHref="/dashboard"
                        />
                    ),
                };
            }
            customerCount = customerCountCached.count || 0;
            notificationsConfigured =
                (notificationPrefsCached.data &&
                notificationPrefsCached.data.length > 0 &&
                (notificationPrefsCached.data[0].email_enabled || notificationPrefsCached.data[0].sms_enabled)) || false;
        } else {
            // ── Precompute date boundaries (used by multiple queries) ──
            const now = new Date();
            const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
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
                // 1. Response Rate (visible rows only; denominator aligned with Total Reviews card)
                supabase
                    .from("reviews")
                    .select("*", { count: "exact", head: true })
                    .eq("business_id", business.id)
                    .eq("is_visible", true)
                    .eq("response_status", "responded"),
                // 2. Pending Reviews Count (kept for diagnostics; display uses visibleReviewRollup.pendingVisible)
                supabase
                    .from("reviews")
                    .select("*", { count: "exact", head: true })
                    .eq("business_id", business.id)
                    .eq("is_visible", true)
                    .eq("response_status", "pending"),
                // 3. Recent Reviews (15 most recent — Review Spotlight carousel)
                supabase
                .from("reviews")
                .select("*")
                .eq("business_id", business.id)
                .eq("is_visible", true)
                .order("review_date", { ascending: false })
                .limit(15),
                // 4. Needs Attention (urgent or negative, still pending)
                supabase
                    .from("reviews")
                    .select("*")
                    .eq("business_id", business.id)
                    .eq("is_visible", true)
                    .eq("response_status", "pending")
                    .or("rating.lte.2,urgency_score.gte.7")
                    .order("urgency_score", { ascending: false, nullsFirst: false })
                    .limit(5),
                // 5. Yearly trend data (since start of last year) — paginated (PostgREST ~1k row cap)
                fetchAllReviewRowsPaginated(1000, (from, to) =>
                    supabase
                        .from("reviews")
                        .select("review_date, rating")
                        .eq("business_id", business.id)
                        .eq("is_visible", true)
                        .gte("review_date", startOfLastYear.toISOString())
                        .order("review_date", { ascending: true })
                        .order("id", { ascending: true })
                        .range(from, to)
                ),
                // 6. 30-day Chart Data
                fetchAllReviewRowsPaginated(1000, (from, to) =>
                    supabase
                        .from("reviews")
                        .select("review_date")
                        .eq("business_id", business.id)
                        .eq("is_visible", true)
                        .gte("review_date", thirtyDaysAgo.toISOString())
                        .order("review_date", { ascending: true })
                        .order("id", { ascending: true })
                        .range(from, to)
                ),
                // 7. Rating Distribution (all-time)
                fetchAllReviewRowsPaginated(1000, (from, to) =>
                    supabase
                        .from("reviews")
                        .select("rating")
                        .eq("business_id", business.id)
                        .eq("is_visible", true)
                        .order("id", { ascending: true })
                        .range(from, to)
                ),
                // 8a. Positive sentiment count
                supabase
                    .from("reviews")
                    .select("*", { count: "exact", head: true })
                    .eq("business_id", business.id)
                    .eq("is_visible", true)
                    .eq("sentiment", "positive"),
                // 8b. Negative/mixed sentiment count
                supabase
                    .from("reviews")
                    .select("*", { count: "exact", head: true })
                    .eq("business_id", business.id)
                    .eq("is_visible", true)
                    .in("sentiment", ["negative", "mixed"]),
                // 8c. Total with sentiment
                supabase
                    .from("reviews")
                    .select("*", { count: "exact", head: true })
                    .eq("business_id", business.id)
                    .eq("is_visible", true)
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
                    .eq("is_visible", true)
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
            const coreFetchError =
                respondedResult.error ||
                pendingResult.error ||
                recentResult.error ||
                attentionResult.error ||
                monthResult.error ||
                trendResult.error ||
                ratingResult.error ||
                positiveResult.error ||
                negMixedResult.error ||
                sentimentTotalResult.error ||
                completedRequestsResult.error ||
                sentRequestsResult.error ||
                monthlyRequestsResult.error ||
                newReview30dResult.error ||
                customerCountResult.error ||
                notificationPrefsResult.error;
            if (coreFetchError) {
                console.error("[Dashboard page] Core fetch failed:", coreFetchError);
                return {
                    errorElement: (
                        <DashboardFetchError
                            message="We could not load dashboard stats for this business. Check your connection and try again."
                            retryHref="/dashboard"
                        />
                    ),
                };
            }

            // ── Process results ──

            // 1–2. Response rate & pending from visible DB rows (not businesses.total_reviews / Google API totals).
            const totalVisible = visibleReviewRollup?.totalVisible ?? 0;
            pendingCount = visibleReviewRollup?.pendingVisible ?? 0;
            if (totalVisible > 0) {
                responseRate = ((respondedResult.count || 0) / totalVisible) * 100;
            } else {
                responseRate = 0;
            }

            // 3. Recent
            recentReviews = recentResult.data || [];

            // 4. Attention
            attentionReviews = attentionResult.data || [];

            // 5. YTD vs same period last year (avoid comparing partial year to full prior year)
            const monthData = (monthResult.data || []) as Array<{
                review_date: string;
                rating: number;
            }>;
            if (monthData.length > 0) {
                const ytd = computeYtdReviewTrends(monthData, now);
                totalReviewsTrend = ytd.totalPct;
                averageRatingTrend = ytd.ratingDelta;
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
        if (googleQaUnavailable) {
            const plRes = await supabase
                .from("gbp_place_action_links")
                .select("*", { count: "exact", head: true })
                .eq("business_id", business.id)
                .eq("is_broken", true);
            if (plRes.error) {
                console.error("[Dashboard page] Google health fetch failed:", plRes.error);
                return {
                    errorElement: (
                        <DashboardFetchError
                            message="We could not load Google health metrics. Check your connection and try again."
                            retryHref="/dashboard"
                        />
                    ),
                };
            }
            unansweredQaCount = 0;
            brokenPlaceLinksCount = plRes.count ?? 0;
        } else {
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
            if (qaRes.error || plRes.error) {
                console.error("[Dashboard page] Google health fetch failed:", qaRes.error || plRes.error);
                return {
                    errorElement: (
                        <DashboardFetchError
                            message="We could not load Google health metrics. Check your connection and try again."
                            retryHref="/dashboard"
                        />
                    ),
                };
            }
            unansweredQaCount = qaRes.count ?? 0;
            brokenPlaceLinksCount = plRes.count ?? 0;
        }
    }

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
        attentionReviews = [...DASHBOARD_DEMO_DATA.attentionReviews];

        // Mock business stats for cards
        business.total_reviews = DASHBOARD_DEMO_DATA.total_reviews;
        business.average_rating = DASHBOARD_DEMO_DATA.average_rating;
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
        totalReviewsTrend = 12;
        averageRatingTrend = 0.1;
        visibleReviewRollup = {
            totalReviewRows: DASHBOARD_DEMO_DATA.total_reviews,
            totalVisible: DASHBOARD_DEMO_DATA.total_reviews,
            pendingVisible: DASHBOARD_DEMO_DATA.pendingCount,
            averageRatingVisible: DASHBOARD_DEMO_DATA.average_rating,
            googleRowCount: DASHBOARD_DEMO_DATA.total_reviews,
            googleVisibleCount: DASHBOARD_DEMO_DATA.total_reviews,
            googleAverageRating: DASHBOARD_DEMO_DATA.average_rating,
            facebookRowCount: 0,
            facebookVisibleCount: 0,
            facebookAverageRating: 0,
            yelpRowCount: 0,
            yelpVisibleCount: 0,
            yelpAverageRating: 0,
        };
    }

    const displayTotalReviews = visibleReviewRollup?.totalVisible ?? 0;
    const displayAverageRating = visibleReviewRollup?.averageRatingVisible ?? 0;

    const currentReviewsCount = displayTotalReviews;
    const responseRateLabel =
        currentReviewsCount > 0
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
        const color = isPositive ? "text-chart-2" : "text-destructive";
        const Icon = isPositive ? TrendingUp : TrendingUp; // Could use TrendingDown for negative but lucide TrendingUp rotated is fine or specific icons

        return (
            <span className={`text-xs font-medium ${color} flex items-center`}>
                {isPositive ? "+" : "-"}{text}
                {isRating ? " stars" : ""}
                {isPositive ? " this month" : " vs last month"}
            </span>
        );
    };

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
    const isHotelBusiness = business.category === "hotel";
    const showLodgingCard = useDemoData || isHotelBusiness || googleLodgingApplicable === true;

    const googleHealthMetricsCount =
        (showUnansweredQaCard ? 1 : 0) + 2 + (showLodgingCard ? 1 : 0);
    const googleHealthMetricsGridClass =
        googleHealthMetricsCount >= 4
            ? "xl:grid-cols-4"
            : googleHealthMetricsCount === 3
              ? "xl:grid-cols-3"
              : "xl:grid-cols-2";

    if (!useDemoData && business.id && isGoogleConnected) {
        const { start, end } = dateRangeLastNDays(365);
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

    const reviewsCount = displayTotalReviews;

    return {
        data: {
            user,
            dict,
            business,
            organization,
            useDemoData,
            isGoogleConnected,
            customerCount,
            notificationsConfigured,
            requestsThisMonth,
            displayTotalReviews,
            displayAverageRating,
            responseRate,
            pendingCount,
            totalReviewsTrend,
            averageRatingTrend,
            responseRateLabel,
            showUnansweredQaCard,
            unansweredQaCount,
            brokenPlaceLinksCount,
            googleProfileHealthScore,
            showLodgingCard,
            googleLodgingHealthScore,
            googleLodgingApplicable,
            googleHealthMetricsGridClass,
            googlePerf,
            positivePercent,
            negativePercent,
            hasSentimentData,
            engagementRate,
            hasEngagementData,
            maxRequestsPerMonth,
            isPaidPlan,
            newReviews30d,
            trendData,
            ratingData,
            recentReviews,
            attentionReviews,
            planAllowsAiReplies,
        },
    };
}
