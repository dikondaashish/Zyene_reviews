import type { CompetitorWatchScanState } from "./competitor-watch-types";
import {
    syncCompetitorWatchRowMetrics,
    type CompetitorWatchRowInput,
} from "./competitor-watch-row-metrics";
import { alertBaseline } from "@/lib/competitors/snapshot-movement";
import { recordCompetitorWatchRowEvents } from "./competitor-watch-row-events";

export async function processCompetitorWatchRow(
    state: CompetitorWatchScanState,
    competitor: CompetitorWatchRowInput,
): Promise<void> {
    const latest = state.latestByCompetitor.get(competitor.id);
    const metrics = await syncCompetitorWatchRowMetrics(state, competitor);
    if (metrics.skip) return;

    // Google sometimes alternates between two totals for one place; compare like with like.
    const baseline = latest ? alertBaseline(latest, state.recentByCompetitor.get(competitor.id) ?? [], metrics.currReviews) : undefined;
    const prevRating = Number(baseline?.average_rating || 0);
    const prevReviews = Number(baseline?.total_reviews || 0);

    // Reading a different Google place than last time (e.g. the first run after
    // switching from name search to the exact place the owner picked) is not a
    // real change: this snapshot becomes the new starting point, with no alerts.
    const placeSwitched = Boolean(latest && metrics.providerPlaceId && latest.provider_place_id !== metrics.providerPlaceId);

    recordCompetitorWatchRowEvents(state, competitor, {
        hasLatest: Boolean(latest) && !placeSwitched,
        currRating: metrics.currRating,
        currReviews: metrics.currReviews,
        ratingDelta: baseline ? Number((metrics.currRating - prevRating).toFixed(1)) : metrics.ratingDelta,
        reviewsDelta: baseline ? metrics.currReviews - prevReviews : metrics.reviewsDelta,
        provider: metrics.provider,
        prevRating,
        prevReviews,
    });
}
