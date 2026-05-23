import { logger } from "@/lib/logger";
import {
    fetchCompetitorMetricsFromGoogle,
    fetchCompetitorPlaceEnrichment,
    competitorEnrichmentToSnapshotMetadata,
} from "@/services/competitors/external-metrics";
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

export async function syncCompetitorWatchRowMetrics(
    state: CompetitorWatchScanState,
    competitor: CompetitorWatchRowInput,
): Promise<{ skip: true } | { skip: false; currRating: number; currReviews: number; ratingDelta: number; reviewsDelta: number; provider: string; providerPlaceId: string | null }> {
    const latest = state.latestByCompetitor.get(competitor.id);
    let currRating = Number(competitor.average_rating || 0);
    let currReviews = Number(competitor.total_reviews || 0);

    const liveMetrics = await fetchCompetitorMetricsFromGoogle({
        name: competitor.name,
        googleUrl: competitor.google_url ?? null,
    });
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
