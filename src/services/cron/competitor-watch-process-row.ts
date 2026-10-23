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

    // Reading a different Google place than last time (e.g. the first run after
    // switching from name search to the exact place the owner picked) is not a
    // real change: this snapshot becomes the new starting point, with no alerts.
    const placeSwitched = Boolean(latest && metrics.providerPlaceId && latest.provider_place_id !== metrics.providerPlaceId);

    recordCompetitorWatchRowEvents(state, competitor, {
        hasLatest: Boolean(latest) && !placeSwitched,
        currRating: metrics.currRating,
        currReviews: metrics.currReviews,
        ratingDelta: metrics.ratingDelta,
        reviewsDelta: metrics.reviewsDelta,
        provider: metrics.provider,
        prevRating,
        prevReviews,
    });
}
