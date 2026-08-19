import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchAllReviewRowsPaginated } from "@/lib/reviews/fetch-reviews-paginated";
import {
  analyticsRangeLabel,
  getAnalyticsPeriods,
  toMonthStartIso,
  type AnalyticsRange,
} from "@/lib/analytics/date-range";
import { effectiveReviewAt } from "@/lib/analytics/review-timeline";
import {
  buildAnalyticsReviewBreakdowns,
  type AnalyticsReviewRow,
} from "@/lib/analytics/build-analytics-review-breakdowns";
import {
  calculateRequestMetrics,
  calculateReviewMetrics,
  type RequestMetricRow,
} from "@/lib/metrics/business-metrics";
import {
  estimateDiscoverySplit,
  getGooglePerformanceDailySeries,
  getGooglePerformanceTotals,
  getGoogleSearchKeywords,
} from "@/services/google/performance-queries";
import { isGoogleBusinessConnected } from "@/lib/google/is-google-connected";
import type { BusinessContextReviewPlatform } from "@/types/business-context";

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
  searchKeywords: Array<{
    keyword: string;
    impressions: number;
    monthStart: string;
  }>;
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
  },
): Promise<AnalyticsFullRangePayload | { error: true }> {
  const { businessId, business, rangeRaw, platform } = args;
  const {
    range: normalizedRange,
    currentStart,
    currentEnd,
    previousStart,
  } = getAnalyticsPeriods(rangeRaw);
  const isZyenePlatform = platform === "zyene";

  const fetchReviewsPage = (from: number, to: number) => {
    let q = supabase
      .from("reviews")
      .select(
        "id, created_at, review_date, platform, rating, response_status, responded_at, sentiment, themes, is_visible",
      )
      .eq("business_id", businessId)
      .eq("is_visible", true)
      .gte("review_date", previousStart.toISOString())
      .lte("review_date", currentEnd.toISOString());

    if (platform === "zyene") {
      q = q.or("platform.eq.zyene,platform.is.null");
    } else if (platform !== "all") {
      q = q.eq("platform", platform);
    }

    return q
      .order("review_date", { ascending: true })
      .order("id", { ascending: true })
      .range(from, to);
  };

  const fetchRequestsPage = (from: number, to: number) =>
    supabase
      .from("review_requests")
      .select(
        "id,status,channel,trigger_source,campaign_id,created_at,sent_at,delivered_at,opened_at,clicked_at,completed_at,rating_given,tags_selected,review_left,customer_name,customer_email,customer_phone,follow_up_sent_at,ai_review_text,email_status,sms_status",
      )
      .eq("business_id", businessId)
      .gte("created_at", previousStart.toISOString())
      .lte("created_at", currentEnd.toISOString())
      .order("id", { ascending: true })
      .range(from, to);

  const privateFeedbackQuery = isZyenePlatform
    ? supabase
        .from("private_feedback")
        .select("id,rating,content,created_at")
        .eq("business_id", businessId)
        .gte("created_at", currentStart.toISOString())
        .order("created_at", { ascending: false })
        .limit(50)
    : null;

  const [reviewsPaged, requestsRes, platformsRes, privateFeedbackResult] =
    await Promise.all([
      fetchAllReviewRowsPaginated(1000, fetchReviewsPage),
      fetchAllReviewRowsPaginated(1000, fetchRequestsPage),
      supabase
        .from("review_platforms")
        .select("platform, google_location_id, sync_status")
        .eq("business_id", businessId),
      privateFeedbackQuery ?? Promise.resolve({ data: null, error: null }),
    ]);

  const privateRes = privateFeedbackResult as {
    data: unknown;
    error: unknown;
  };
  if (
    reviewsPaged.error ||
    requestsRes.error ||
    platformsRes.error ||
    privateRes.error
  ) {
    return { error: true };
  }

  const allReviews = (reviewsPaged.data || []) as AnalyticsReviewRow[];
  const allRequests = (requestsRes.data || []) as Array<
    RequestMetricRow & { created_at: string; [key: string]: unknown }
  >;
  const connectedPlatforms: string[] = [];
  for (const platform of platformsRes.data || []) {
    const typed = platform as BusinessContextReviewPlatform;
    if (typed.platform === "google" && !isGoogleBusinessConnected([typed]))
      continue;
    if (typeof typed.platform === "string")
      connectedPlatforms.push(typed.platform);
  }
  const privateFeedback = Array.isArray(privateRes.data) ? privateRes.data : [];

  const currentReviews = allReviews.filter(
    (r) => effectiveReviewAt(r) >= currentStart,
  );
  const previousReviews = allReviews.filter(
    (r) => effectiveReviewAt(r) < currentStart,
  );
  const currentRequests = allRequests.filter(
    (r) => new Date(r.created_at) >= currentStart,
  );
  const previousRequests = allRequests.filter(
    (r) => new Date(r.created_at) < currentStart,
  );

  const currentReviewMetrics = calculateReviewMetrics(currentReviews);
  const previousReviewMetrics = calculateReviewMetrics(previousReviews);
  const currentRequestMetrics = calculateRequestMetrics(currentRequests);
  const previousRequestMetrics = calculateRequestMetrics(previousRequests);
  const totalReviews = currentReviewMetrics.totalReviews;
  const avgRating = currentReviewMetrics.averageRating;
  const respondedCount = currentReviewMetrics.respondedReviews;
  const responseRate = currentReviewMetrics.responseRate;
  const requestsCount = currentRequestMetrics.totalSent;
  const prevTotalReviews = previousReviewMetrics.totalReviews;
  const prevAvgRating = previousReviewMetrics.averageRating;
  const prevResponseRate = previousReviewMetrics.responseRate;
  const prevRequestsCount = previousRequestMetrics.totalSent;

  const getDelta = (curr: number, prev: number): number | null => {
    if (prev === 0) return curr === 0 ? 0 : null;
    return ((curr - prev) / prev) * 100;
  };

  const isGoogleConnected = connectedPlatforms.includes("google");
  let perfTotals: Record<string, unknown> | null = null;
  let perfSeries: unknown[] = [];
  let searchKeywords: Array<{
    keyword: string;
    impressions: number;
    monthStart: string;
  }> = [];
  let discoverySplit = { discoveryPct: 0, directPct: 0 };

  if (isGoogleConnected) {
    const keywordSinceMonth = toMonthStartIso(currentStart);
    const [totals, series, keywords] = await Promise.all([
      getGooglePerformanceTotals(
        supabase,
        businessId,
        currentStart,
        currentEnd,
      ),
      getGooglePerformanceDailySeries(
        supabase,
        businessId,
        currentStart,
        currentEnd,
      ),
      getGoogleSearchKeywords(supabase, businessId, 30, keywordSinceMonth),
    ]);
    perfTotals = totals as Record<string, unknown> | null;
    perfSeries = series || [];
    searchKeywords = keywords || [];
    discoverySplit = estimateDiscoverySplit(
      searchKeywords.map((k) => ({
        keyword: k.keyword,
        impressions: k.impressions,
      })),
      business?.name ?? "",
    );
  }

  const { trendData, sentimentData, themeData, platformData } =
    buildAnalyticsReviewBreakdowns(
      currentReviews,
      currentReviewMetrics,
      perfTotals,
    );

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
