import {
  competitorRangeLabel,
  type CompetitorRangeKey,
} from "@/lib/competitors/date-range";
import {
  averageRatingFromReviewRatings,
  hasSyncedCompetitorMetrics,
  marketAverageEndRating,
} from "@/lib/competitors/range-benchmark";
import { parsePlacesMetaFromSnapshot } from "@/lib/competitors/places-snapshot-meta";
import { estimateDiscoverySplit } from "@/services/google/performance-queries";
import type { CompetitorSnapshotRow } from "./range-data-fetch";

type CompetitorListItem = {
  id: string;
  average_rating: number | null;
  total_reviews: number | null;
};

export function buildCompetitorsRangeDataPayload(params: {
  range: CompetitorRangeKey;
  competitorsList: CompetitorListItem[];
  snapshotRowsTyped: CompetitorSnapshotRow[];
  eventRows: unknown[];
  insightRows: unknown[];
  ownRatings: number[];
  ownBusiness: { name?: string | null; average_rating?: number | null } | null;
  ownSearchKeywords: Array<{ keyword: string; impressions: number }>;
  latestSnapRows: Array<{
    competitor_id: string;
    captured_at: string;
    metadata: Record<string, unknown> | null;
  }>;
}) {
  const {
    range,
    competitorsList,
    snapshotRowsTyped,
    eventRows,
    insightRows,
    ownRatings,
    ownBusiness,
    ownSearchKeywords,
    latestSnapRows,
  } = params;

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

  return {
    range,
    rangeLabel: competitorRangeLabel(range),
    initialCompetitors: competitorsList,
    snapshotRows: snapshotRowsTyped,
    eventRows,
    insightRows,
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
  };
}
