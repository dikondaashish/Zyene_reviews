import type { CompetitorWatchScanState } from "./competitor-watch-types";
import {
    syncCompetitorWatchRowMetrics,
    type CompetitorWatchRowInput,
} from "./competitor-watch-row-metrics";
import { recordCompetitorWatchRowEvents } from "./competitor-watch-row-events";

export async function processCompetitorWatchRow(
    state: CompetitorWatchScanState,
    competitor: CompetitorWatchRowInput,
): Promise<void> {
    const latest = state.latestByCompetitor.get(competitor.id);
    const metrics = await syncCompetitorWatchRowMetrics(state, competitor);
    if (metrics.skip) return;

    const prevRating = Number(latest?.average_rating || 0);
    const prevReviews = Number(latest?.total_reviews || 0);

    recordCompetitorWatchRowEvents(state, competitor, {
        hasLatest: Boolean(latest),
        currRating: metrics.currRating,
        currReviews: metrics.currReviews,
        ratingDelta: metrics.ratingDelta,
        reviewsDelta: metrics.reviewsDelta,
        provider: metrics.provider,
        prevRating,
        prevReviews,
    });
}
