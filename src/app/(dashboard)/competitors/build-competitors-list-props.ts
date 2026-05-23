import { createClient } from "@/lib/db/supabase/server";
import {
    parsePlacesMetaFromSnapshot,
    type CompetitorPlacesRowMeta,
} from "@/lib/competitors/places-snapshot-meta";
import { parseCompetitorsMarketBrief } from "./competitors-market-brief";
import { buildCompetitorsBenchmarkRange } from "./competitors-benchmark-range";
import { averageRatingFromReviewRatings } from "@/lib/competitors/range-benchmark";
import { estimateDiscoverySplit } from "@/services/google/performance-queries";
import { fetchVisibleReviewRollupsByBusinessIds } from "@/lib/reviews/visible-review-rollups";
import type { CompetitorsListProps } from "./competitors-page-types";
import type { fetchCompetitorsPageRaw } from "./fetch-competitors-page-raw";
import { normalizeCompetitorRange } from "@/lib/competitors/date-range";

type Raw = Extract<Awaited<ReturnType<typeof fetchCompetitorsPageRaw>>, { ok: true }>;

export async function buildCompetitorsListProps(
    businessId: string,
    range: ReturnType<typeof normalizeCompetitorRange>,
    raw: Raw
): Promise<CompetitorsListProps> {
    const supabase = await createClient();
    const visibleRollupMap = await fetchVisibleReviewRollupsByBusinessIds(supabase, [businessId]);
    const visibleRollupAll = visibleRollupMap.get(businessId)!;

    const snapshotRowsTyped = (raw.snapshotsRes.data || []) as Array<{
        id: string;
        competitor_id: string;
        business_id: string;
        captured_at: string;
        average_rating: number;
        total_reviews: number;
        source: string;
        metadata: Record<string, unknown> | null;
    }>;
    const competitorsList = raw.competitors || [];
    const ownRatings = (raw.ownReviewsInRangeRes.data || []).map((r: { rating: number }) => Number(r.rating));
    const ownAvgInRange = averageRatingFromReviewRatings(ownRatings);

    const benchmarkRange = buildCompetitorsBenchmarkRange(
        range,
        competitorsList,
        snapshotRowsTyped,
        ownRatings,
        visibleRollupAll.totalVisible > 0 ? visibleRollupAll.averageRatingVisible : 0
    );

    const keywordDiscoverySplit = estimateDiscoverySplit(
        raw.ownSearchKeywords.map((k) => ({ keyword: k.keyword, impressions: k.impressions })),
        raw.ownBusiness?.name ?? ""
    );

    const placesMetaByCompetitorId: Record<string, CompetitorPlacesRowMeta> = {};
    const latestSnapRows = (raw.latestSnapshotsForPlacesMetaRes.data || []) as Array<{
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

    const marketBriefLatest = parseCompetitorsMarketBrief(
        raw.latestMarketBriefRes.data as Record<string, unknown> | null
    );

    return {
        businessId,
        initialCompetitors: raw.competitors || [],
        range,
        snapshotRows: snapshotRowsTyped,
        eventRows: (raw.eventsRes.data || []) as CompetitorsListProps["eventRows"],
        insightRows: (raw.insightsRes.data || []) as CompetitorsListProps["insightRows"],
        latestRun: (raw.latestRunRes.data as CompetitorsListProps["latestRun"]) ?? null,
        latestSuccessRun: (raw.latestSuccessRunRes.data as CompetitorsListProps["latestSuccessRun"]) ?? null,
        latestFailedRun: (raw.latestFailedRunRes.data as CompetitorsListProps["latestFailedRun"]) ?? null,
        ownBusinessInRange: { avgRating: ownAvgInRange, reviewCount: ownRatings.length },
        benchmarkRange,
        ownSearchKeywords: raw.ownSearchKeywords,
        keywordDiscoverySplit,
        placesMetaByCompetitorId,
        marketBriefLatest,
        ownBusinessChart: {
            name: raw.ownBusiness?.name ?? "Your business",
            averageRating: visibleRollupAll.totalVisible > 0 ? visibleRollupAll.averageRatingVisible : null,
            totalReviews: visibleRollupAll.totalVisible > 0 ? visibleRollupAll.totalVisible : null,
        },
    };
}
