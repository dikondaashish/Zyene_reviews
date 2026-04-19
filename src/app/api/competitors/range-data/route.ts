import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import {
  competitorRangeLabel,
  getCompetitorRangeStart,
  normalizeCompetitorRange,
} from "@/lib/competitors/date-range";
import {
  averageRatingFromReviewRatings,
  hasSyncedCompetitorMetrics,
  marketAverageEndRating,
} from "@/lib/competitors/range-benchmark";
import { parsePlacesMetaFromSnapshot } from "@/lib/competitors/places-snapshot-meta";
import { estimateDiscoverySplit, getGoogleSearchKeywords } from "@/services/google/performance-queries";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { businessId } = await getActiveBusinessId();
  if (!businessId) return NextResponse.json({ error: "No active business" }, { status: 400 });

  const url = new URL(request.url);
  const range = normalizeCompetitorRange(url.searchParams.get("range") ?? undefined);
  const rangeStart = getCompetitorRangeStart(range);

  const { data: competitors, error: competitorsError } = await supabase
    .from("competitors")
    .select("id, business_id, name, google_url, average_rating, total_reviews, created_at, updated_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  const { data: ownBusiness } = await supabase
    .from("businesses")
    .select("id, name, average_rating, total_reviews")
    .eq("id", businessId)
    .maybeSingle();

  const snapshotsPromise = (supabase.from("competitor_snapshots" as never) as any)
    .select("id, competitor_id, business_id, captured_at, average_rating, total_reviews, source, metadata")
    .eq("business_id", businessId)
    .gte("captured_at", rangeStart.toISOString())
    .order("captured_at", { ascending: false })
    .limit(1000);

  const eventsPromise = (supabase.from("competitor_events" as never) as any)
    .select("id, competitor_id, business_id, event_type, title, summary, event_value, event_delta, created_at")
    .eq("business_id", businessId)
    .gte("created_at", rangeStart.toISOString())
    .order("created_at", { ascending: false })
    .limit(200);

  const insightsPromise = (supabase.from("competitor_insights" as never) as any)
    .select("id, competitor_id, business_id, range_key, summary, why_it_matters, owner_suggestion, actions, priority, confidence, recommendations, model, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(100);

  const ownReviewsInRangePromise = supabase
    .from("reviews")
    .select("rating")
    .eq("business_id", businessId)
    .eq("is_visible", true)
    .gte("review_date", rangeStart.toISOString());

  const latestSnapshotsForPlacesMetaPromise = (supabase.from("competitor_snapshots" as never) as any)
    .select("competitor_id, captured_at, metadata")
    .eq("business_id", businessId)
    .order("captured_at", { ascending: false })
    .limit(400);

  const [snapshotsRes, eventsRes, insightsRes, ownReviewsInRangeRes, latestSnapshotsForPlacesMetaRes, ownSearchKeywords] =
    await Promise.all([
      snapshotsPromise,
      eventsPromise,
      insightsPromise,
      ownReviewsInRangePromise,
      latestSnapshotsForPlacesMetaPromise,
      getGoogleSearchKeywords(supabase, businessId, 15),
    ]);

  if (
    competitorsError ||
    snapshotsRes.error ||
    eventsRes.error ||
    insightsRes.error ||
    ownReviewsInRangeRes.error ||
    latestSnapshotsForPlacesMetaRes.error
  ) {
    return NextResponse.json({ error: "Failed to load competitors range data" }, { status: 500 });
  }

  const snapshotRowsTyped = (snapshotsRes.data || []) as Array<{
    id: string;
    competitor_id: string;
    business_id: string;
    captured_at: string;
    average_rating: number;
    total_reviews: number;
    source: string;
    metadata: Record<string, unknown> | null;
  }>;
  const competitorsList = competitors || [];
  const ownRatings = (ownReviewsInRangeRes.data || []).map((r: { rating: number }) => Number(r.rating));
  const ownAvgInRange = averageRatingFromReviewRatings(ownRatings);
  const { avgEnd: marketEndAvgRating, usedFallback: marketEndUsedFallback } = marketAverageEndRating(
    competitorsList.map((c) => ({
      id: c.id,
      average_rating: c.average_rating,
      total_reviews: c.total_reviews,
    })),
    snapshotRowsTyped.map((s) => ({
      competitor_id: s.competitor_id,
      captured_at: s.captured_at,
      average_rating: s.average_rating,
      total_reviews: s.total_reviews,
      source: s.source,
    }))
  );

  const marketBenchmarkAvailable =
    competitorsList.length === 0 ||
    hasSyncedCompetitorMetrics(
      competitorsList.map((c) => ({
        id: c.id,
        average_rating: c.average_rating,
        total_reviews: c.total_reviews,
      })),
      snapshotRowsTyped.map((s) => ({
        competitor_id: s.competitor_id,
        captured_at: s.captured_at,
        average_rating: s.average_rating,
        total_reviews: s.total_reviews,
        source: s.source,
      }))
    );

  const yourRatingForRank = ownAvgInRange !== null ? ownAvgInRange : Number(ownBusiness?.average_rating || 0);
  const competitorEndRatings = competitorsList.map((c) => {
    const rows = snapshotRowsTyped
      .filter((s) => s.competitor_id === c.id)
      .sort((a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime());
    const last = rows[rows.length - 1];
    return last ? Number(last.average_rating || 0) : Number(c.average_rating || 0);
  });
  const combinedForRank = [yourRatingForRank, ...competitorEndRatings];
  const sortedForRank = combinedForRank.slice().sort((a, b) => b - a);
  const rankInRange =
    !marketBenchmarkAvailable && competitorsList.length > 0
      ? null
      : sortedForRank.length > 0
      ? sortedForRank.findIndex((v) => Math.abs(v - yourRatingForRank) < 0.001) + 1
      : null;

  const placesMetaByCompetitorId: Record<string, unknown> = {};
  const latestSnapRows = (latestSnapshotsForPlacesMetaRes.data || []) as Array<{
    competitor_id: string;
    captured_at: string;
    metadata: Record<string, unknown> | null;
  }>;
  for (const row of latestSnapRows) {
    if (placesMetaByCompetitorId[row.competitor_id]) continue;
    const parsed = parsePlacesMetaFromSnapshot(row.metadata);
    if (parsed && (parsed.primaryType || parsed.websiteUrl || parsed.summary || parsed.typesPreview)) {
      placesMetaByCompetitorId[row.competitor_id] = parsed;
    }
  }

  const keywordDiscoverySplit = estimateDiscoverySplit(
    ownSearchKeywords.map((k) => ({ keyword: k.keyword, impressions: k.impressions })),
    ownBusiness?.name ?? ""
  );

  return NextResponse.json(
    {
      range,
      rangeLabel: competitorRangeLabel(range),
      initialCompetitors: competitorsList,
      snapshotRows: snapshotRowsTyped,
      eventRows: eventsRes.data || [],
      insightRows: insightsRes.data || [],
      ownBusinessInRange: {
        avgRating: ownAvgInRange,
        reviewCount: ownRatings.length,
      },
      benchmarkRange: {
        label: competitorRangeLabel(range),
        marketEndAvgRating,
        marketEndUsedFallback,
        marketBenchmarkAvailable,
        yourRatingForRank,
        rank: rankInRange,
        totalRanked: combinedForRank.length,
        yourAvgVsMarketEnd: ownAvgInRange !== null && marketBenchmarkAvailable ? ownAvgInRange - marketEndAvgRating : null,
        yourReviewsInRange: ownRatings.length,
        marketAvgReviewGain: null,
      },
      ownSearchKeywords,
      keywordDiscoverySplit,
      placesMetaByCompetitorId,
    },
    {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
      },
    }
  );
}
