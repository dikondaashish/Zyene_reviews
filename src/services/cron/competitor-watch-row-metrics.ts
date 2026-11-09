import { logger } from "@/lib/logger";
import {
    fetchCompetitorPlaceEnrichment,
    competitorEnrichmentToSnapshotMetadata,
} from "@/services/competitors/external-metrics";
import { fetchCompetitorMetricsOutcome } from "@/services/competitors/live-metrics-outcome";
import { sameUtcDay } from "./competitor-watch-helpers";
import type { CompetitorWatchScanState } from "./competitor-watch-types";

export type CompetitorWatchRowInput = {
    id: string;
    business_id: string;
    name: string;
    average_rating: number | null;
    total_reviews: number | null;
    google_url?: string | null;
};

/**
 * Competitors whose live Google Places read failed (or no key is configured) in a scan.
 * A healthy "no match" is not counted: Google answered, there is just no listing.
 * Kept beside the scan state rather than in it so the shared state type stays as-is.
 * A scan with unavailable rows must not be logged as "success": the page would show
 * "Updated from Google" while it is really showing stored numbers.
 */
const placesUnavailableByScan = new WeakMap<CompetitorWatchScanState, Set<string>>();

export function placesUnavailableCompetitorIds(state: CompetitorWatchScanState): string[] {
    return [...(placesUnavailableByScan.get(state) ?? [])];
}

function markPlacesUnavailable(state: CompetitorWatchScanState, competitorId: string): void {
    const ids = placesUnavailableByScan.get(state) ?? new Set<string>();
    ids.add(competitorId);
    placesUnavailableByScan.set(state, ids);
}

export async function syncCompetitorWatchRowMetrics(
    state: CompetitorWatchScanState,
    competitor: CompetitorWatchRowInput,
): Promise<{ skip: true } | { skip: false; currRating: number; currReviews: number; ratingDelta: number; reviewsDelta: number; provider: string; providerPlaceId: string | null }> {
    const latest = state.latestByCompetitor.get(competitor.id);
    let currRating = Number(competitor.average_rating || 0);
    let currReviews = Number(competitor.total_reviews || 0);

    const outcome = await fetchCompetitorMetricsOutcome({
        name: competitor.name,
        googleUrl: competitor.google_url ?? null,
    });
    if (outcome.kind === "unavailable") markPlacesUnavailable(state, competitor.id);
    const liveMetrics = outcome.kind === "ok" ? outcome.metrics : null;
    if (liveMetrics) {
        currRating = Number(liveMetrics.averageRating || 0);
        currReviews = Number(liveMetrics.totalReviews || 0);
        if (
            currRating !== Number(competitor.average_rating || 0) ||
            currReviews !== Number(competitor.total_reviews || 0)
        ) {
            const { error: updErr } = await state.admin
                .from("competitors")
                .update({
                    average_rating: currRating,
                    total_reviews: currReviews,
                    updated_at: state.now.toISOString(),
                })
                .eq("id", competitor.id);
            if (updErr) {
                logger.error({ err: updErr }, "[cron/competitor-watch] competitor metrics update failed:");
            } else {
                state.externalUpdates++;
                state.businessExternalUpdates.set(
                    competitor.business_id,
                    (state.businessExternalUpdates.get(competitor.business_id) ?? 0) + 1,
                );
            }
        }
    }

    const provider = liveMetrics?.provider ?? "db_fallback";
    const providerPlaceId = liveMetrics?.placeId ?? null;
    const prevRating = Number(latest?.average_rating || 0);
    const prevReviews = Number(latest?.total_reviews || 0);
    const ratingDelta = Number((currRating - prevRating).toFixed(1));
    const reviewsDelta = currReviews - prevReviews;

    const sameDay = latest ? sameUtcDay(latest.captured_at, state.now) : false;
    const unchanged = latest ? ratingDelta === 0 && reviewsDelta === 0 : false;
    if (sameDay && unchanged) {
        return { skip: true };
    }

    let placesExtra: Record<string, unknown> = {};
    if (providerPlaceId) {
        const enrichment = await fetchCompetitorPlaceEnrichment({
            placeResourceName: providerPlaceId,
        });
        if (enrichment) {
            placesExtra = competitorEnrichmentToSnapshotMetadata(enrichment);
        }
    }

    state.snapshotsToInsert.push({
        competitor_id: competitor.id,
        business_id: competitor.business_id,
        captured_at: state.now.toISOString(),
        average_rating: currRating,
        total_reviews: currReviews,
        source: "cron",
        metadata: {
            previous_rating: prevRating,
            previous_reviews: prevReviews,
            rating_delta: ratingDelta,
            reviews_delta: reviewsDelta,
            provider,
            provider_place_id: providerPlaceId,
            ...placesExtra,
        },
    });

    return { skip: false, currRating, currReviews, ratingDelta, reviewsDelta, provider, providerPlaceId };
}
