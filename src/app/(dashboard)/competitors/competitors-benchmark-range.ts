import {
    marketAverageEndRating,
    averageRatingFromReviewRatings,
    hasSyncedCompetitorMetrics,
} from "@/lib/competitors/range-benchmark";
import { competitorRangeLabel, normalizeCompetitorRange } from "@/lib/competitors/date-range";
import type { CompetitorWatchBenchmarkRange } from "./competitors-types";

type SnapshotRow = {
    competitor_id: string;
    captured_at: string;
    average_rating: number;
    total_reviews: number;
    source: string;
};

type CompetitorRow = {
    id: string;
    average_rating: number | null;
    total_reviews: number | null;
};

export function buildCompetitorsBenchmarkRange(
    range: ReturnType<typeof normalizeCompetitorRange>,
    competitorsList: CompetitorRow[],
    snapshotRowsTyped: SnapshotRow[],
    ownRatings: number[],
    yourRatingFallback: number
): CompetitorWatchBenchmarkRange {
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

    const yourRatingForRank = ownAvgInRange !== null ? ownAvgInRange : yourRatingFallback;
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

    return {
        label: competitorRangeLabel(range),
        marketEndAvgRating,
        marketEndUsedFallback,
        marketBenchmarkAvailable,
        yourRatingForRank,
        rank: rankInRange,
        totalRanked: combinedForRank.length,
        yourAvgVsMarketEnd:
            ownAvgInRange !== null && marketBenchmarkAvailable ? ownAvgInRange - marketEndAvgRating : null,
        yourReviewsInRange: ownRatings.length,
        marketAvgReviewGain: (() => {
            const gains = competitorsList.map((c) => {
                const meaningful = snapshotRowsTyped
                    .filter(
                        (s) =>
                            s.competitor_id === c.id &&
                            (Number(s.total_reviews) > 0 || Number(s.average_rating) > 0)
                    )
                    .sort(
                        (a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime()
                    );
                if (meaningful.length < 2) return null;
                const first = meaningful[0];
                const last = meaningful[meaningful.length - 1];
                return Number(last.total_reviews) - Number(first.total_reviews);
            });
            const nums = gains.filter((g): g is number => g !== null);
            if (nums.length === 0) return null;
            return nums.reduce((a, b) => a + b, 0) / nums.length;
        })(),
    };
}
