import type { SupabaseClient } from "@supabase/supabase-js";
import {
    analyticsRangeLabel,
    getAnalyticsPeriods,
    toMonthStartIso,
    type AnalyticsRange,
} from "@/lib/analytics/date-range";
import { displaySentimentLabel, effectiveReviewAt } from "@/lib/analytics/review-timeline";
import {
    estimateDiscoverySplit,
    getGooglePerformanceDailySeries,
    getGooglePerformanceTotals,
    getGoogleSearchKeywords,
} from "@/services/google/performance-queries";

export type AnalyticsFullRangePayload = {
    range: AnalyticsRange;
    platform: string;
    isDemo: boolean;
    rangeLabel: string;
    connectedPlatforms: string[];
    stats: {
        totalReviews: number;
        avgRating: number;
        responseRate: number;
        respondedCount: number;
        requestsCount: number;
        reviewsDelta: number | null;
        ratingDelta: number | null;
        responseRateDelta: number | null;
        requestsDelta: number | null;
    };
    trendData: Array<{
        date: string;
        rating: number;
        count: number;
        positive: number;
        neutral: number;
        negative: number;
    }>;
    sentimentData: Array<{ name: string; value: number; color: string }>;
    themeData: Array<{ theme: string; count: number; sentimentScore: number }>;
    platformData: Array<{
        platform: string;
        reviews: number;
        avgRating: number;
        responseRate: number;
        profileViews?: number;
        callClicks?: number;
        directionRequests?: number;
        websiteClicks?: number;
    }>;
    perfTotals: Record<string, unknown> | null;
    perfSeries: unknown[];
    discoverySplit: { discoveryPct: number; directPct: number };
    searchKeywords: Array<{ keyword: string; impressions: number; monthStart: string }>;
    allRequests: unknown[];
    previousRequests: unknown[];
    privateFeedback: unknown[];
};

export async function buildAnalyticsRangePayload(
    supabase: SupabaseClient,
    args: {
        businessId: string;
        business: { name?: string | null | undefined } | null;
        rangeRaw: string | null | undefined;
        platform: string;
    }
): Promise<AnalyticsFullRangePayload | { error: true }> {
    const { businessId, business, rangeRaw, platform } = args;
    const { range: normalizedRange, currentStart, currentEnd, previousStart } = getAnalyticsPeriods(rangeRaw);
    const isZyenePlatform = platform === "zyene";

    let reviewsQuery = supabase
        .from("reviews")
        .select(
            "id, created_at, review_date, platform, rating, response_status, responded_at, sentiment, themes, is_visible"
        )
        .eq("business_id", businessId)
        .or("is_visible.is.null,is_visible.eq.true")
        .gte("review_date", previousStart.toISOString())
        .lte("review_date", currentEnd.toISOString())
        .order("review_date", { ascending: true });

    if (platform === "zyene") {
        reviewsQuery = reviewsQuery.or("platform.eq.zyene,platform.is.null");
    } else if (platform !== "all") {
        reviewsQuery = reviewsQuery.eq("platform", platform);
    }

    const requestsQuery: PromiseLike<{ data: unknown[] | null; error: unknown }> = isZyenePlatform
        ? supabase
              .from("review_requests")
              .select(
                  "id,status,channel,trigger_source,campaign_id,created_at,sent_at,delivered_at,opened_at,clicked_at,completed_at,rating_given,tags_selected,review_left,customer_name,customer_email,customer_phone,follow_up_sent_at,ai_review_text"
              )
              .eq("business_id", businessId)
              .gte("created_at", previousStart.toISOString())
              .lte("created_at", currentEnd.toISOString())
        : supabase
              .from("review_requests")
              .select("id,created_at")
              .eq("business_id", businessId)
              .gte("created_at", previousStart.toISOString())
              .lte("created_at", currentEnd.toISOString());

    const privateFeedbackQuery = isZyenePlatform
        ? supabase
              .from("private_feedback")
              .select("id,rating,content,created_at")
              .eq("business_id", businessId)
              .gte("created_at", currentStart.toISOString())
              .order("created_at", { ascending: false })
              .limit(50)
        : null;

    const [reviewsRes, requestsRes, platformsRes, privateFeedbackResult] = await Promise.all([
        reviewsQuery,
        requestsQuery,
        supabase.from("review_platforms").select("platform").eq("business_id", businessId),
        privateFeedbackQuery ?? Promise.resolve({ data: null, error: null }),
    ]);

    const privateRes = privateFeedbackResult as { data: unknown; error: unknown };
    if (reviewsRes.error || requestsRes.error || platformsRes.error || privateRes.error) {
        return { error: true };
    }

    const allReviews = (reviewsRes.data || []) as Array<{
        review_date?: string;
        created_at?: string;
        rating?: number;
        response_status?: string;
        responded_at?: string | null;
        sentiment?: string;
        themes?: string[];
        [key: string]: unknown;
    }>;
    const allRequests = (requestsRes.data || []) as Array<{ created_at: string; [key: string]: unknown }>;
    const connectedPlatforms = (platformsRes.data || []).map((p: { platform: string }) => p.platform);
    const privateFeedback = Array.isArray(privateRes.data) ? privateRes.data : [];

    const currentReviews = allReviews.filter((r) => effectiveReviewAt(r) >= currentStart);
    const previousReviews = allReviews.filter((r) => effectiveReviewAt(r) < currentStart);
    const currentRequests = allRequests.filter((r) => new Date(r.created_at) >= currentStart);
    const previousRequests = allRequests.filter((r) => new Date(r.created_at) < currentStart);

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

    const getDelta = (curr: number, prev: number): number | null => {
        if (prev === 0) return curr === 0 ? 0 : null;
        return ((curr - prev) / prev) * 100;
    };

    const dateMap = new Map<
        string,
        { date: string; ratingSum: number; count: number; positive: number; neutral: number; negative: number }
    >();
    currentReviews.forEach((r) => {
        const date = effectiveReviewAt(r).toISOString().split("T")[0];
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
        .map((d) => ({
            date: d.date,
            rating: d.ratingSum / d.count,
            count: d.count,
            positive: d.positive,
            neutral: d.neutral,
            negative: d.negative,
        }));

    const sentimentCounts = { positive: 0, neutral: 0, negative: 0, mixed: 0 };
    currentReviews.forEach((r) => {
        const label = displaySentimentLabel(r);
        if (label === "positive") sentimentCounts.positive++;
        else if (label === "negative") sentimentCounts.negative++;
        else if (label === "mixed") sentimentCounts.mixed++;
        else sentimentCounts.neutral++;
    });

    const sentimentData = [
        { name: "Positive", value: sentimentCounts.positive, color: "var(--chart-2)" },
        { name: "Neutral", value: sentimentCounts.neutral, color: "var(--chart-3)" },
        { name: "Negative", value: sentimentCounts.negative, color: "var(--destructive)" },
        { name: "Mixed", value: sentimentCounts.mixed, color: "var(--chart-5)" },
    ].filter((d) => d.value > 0);

    const themeMap = new Map<string, { count: number; sentimentScore: number }>();
    currentReviews.forEach((r) => {
        if (!Array.isArray(r.themes)) return;
        r.themes.forEach((t: string) => {
            const theme = t.toLowerCase();
            if (!themeMap.has(theme)) themeMap.set(theme, { count: 0, sentimentScore: 0 });
            const entry = themeMap.get(theme)!;
            entry.count++;
            if (r.rating && r.rating >= 4) entry.sentimentScore++;
            if (r.rating && r.rating <= 2) entry.sentimentScore--;
        });
    });

    const themeData = Array.from(themeMap.entries())
        .map(([theme, data]) => ({ theme, ...data }))
        .filter((t) => t.count >= 2)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    const isGoogleConnected = connectedPlatforms.includes("google");
    let perfTotals: Record<string, unknown> | null = null;
    let perfSeries: unknown[] = [];
    let searchKeywords: Array<{ keyword: string; impressions: number; monthStart: string }> = [];
    let discoverySplit = { discoveryPct: 0, directPct: 0 };

    if (isGoogleConnected) {
        const keywordSinceMonth = toMonthStartIso(currentStart);
        const [totals, series, keywords] = await Promise.all([
            getGooglePerformanceTotals(supabase, businessId, currentStart, currentEnd),
            getGooglePerformanceDailySeries(supabase, businessId, currentStart, currentEnd),
            getGoogleSearchKeywords(supabase, businessId, 30, keywordSinceMonth),
        ]);
        perfTotals = totals as Record<string, unknown> | null;
        perfSeries = series || [];
        searchKeywords = keywords || [];
        discoverySplit = estimateDiscoverySplit(
            searchKeywords.map((k) => ({ keyword: k.keyword, impressions: k.impressions })),
            business?.name ?? ""
        );
    }

    const normalizePlatformName = (p: unknown): string => {
        const raw = typeof p === "string" ? p.trim().toLowerCase() : "";
        if (!raw || raw === "zyene") return "Own Platform";
        if (raw === "google") return "Google";
        if (raw === "facebook") return "Facebook";
        return raw.charAt(0).toUpperCase() + raw.slice(1);
    };

    const platformAgg = new Map<string, { reviews: number; ratingSum: number; responded: number }>();
    currentReviews.forEach((r) => {
        const name = normalizePlatformName(r.platform);
        if (!platformAgg.has(name)) {
            platformAgg.set(name, { reviews: 0, ratingSum: 0, responded: 0 });
        }
        const entry = platformAgg.get(name)!;
        entry.reviews += 1;
        entry.ratingSum += r.rating || 0;
        if (r.response_status === "responded" || r.responded_at) entry.responded += 1;
    });

    const platformOrder = ["Google", "Own Platform", "Facebook"];
    const platformData = Array.from(platformAgg.entries())
        .map(([name, agg]) => ({
            platform: name,
            reviews: agg.reviews,
            avgRating: agg.reviews > 0 ? agg.ratingSum / agg.reviews : 0,
            responseRate: agg.reviews > 0 ? (agg.responded / agg.reviews) * 100 : 0,
            profileViews:
                name === "Google" ? (perfTotals as { profileViews?: number } | null)?.profileViews : undefined,
            callClicks:
                name === "Google" ? (perfTotals as { callClicks?: number } | null)?.callClicks : undefined,
            directionRequests:
                name === "Google"
                    ? (perfTotals as { directionRequests?: number } | null)?.directionRequests
                    : undefined,
            websiteClicks:
                name === "Google" ? (perfTotals as { websiteClicks?: number } | null)?.websiteClicks : undefined,
        }))
        .sort((a, b) => {
            const ai = platformOrder.indexOf(a.platform);
            const bi = platformOrder.indexOf(b.platform);
            if (ai === -1 && bi === -1) return b.reviews - a.reviews;
            if (ai === -1) return 1;
            if (bi === -1) return -1;
            return ai - bi;
        });

    return {
        range: normalizedRange,
        platform,
        isDemo: !isGoogleConnected,
        rangeLabel: analyticsRangeLabel(normalizedRange),
        connectedPlatforms,
        stats: {
            totalReviews,
            avgRating,
            responseRate,
            respondedCount,
            requestsCount,
            reviewsDelta: getDelta(totalReviews, prevTotalReviews),
            ratingDelta: getDelta(avgRating, prevAvgRating),
            responseRateDelta: getDelta(responseRate, prevResponseRate),
            requestsDelta: getDelta(requestsCount, prevRequestsCount),
        },
        trendData,
        sentimentData,
        themeData,
        platformData,
        perfTotals,
        perfSeries,
        discoverySplit,
        searchKeywords,
        allRequests: currentRequests,
        previousRequests,
        privateFeedback,
    };
}
