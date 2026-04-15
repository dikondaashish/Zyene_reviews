import type { SupabaseClient } from "@supabase/supabase-js";
import {
    fetchCompetitorMetricsFromGoogle,
    type ExternalCompetitorMetrics,
} from "@/services/competitors/external-metrics";

function sameUtcDay(aIso: string, b: Date): boolean {
    const a = new Date(aIso);
    return (
        a.getUTCFullYear() === b.getUTCFullYear() &&
        a.getUTCMonth() === b.getUTCMonth() &&
        a.getUTCDate() === b.getUTCDate()
    );
}

export type CompetitorRowForMetrics = {
    id: string;
    business_id: string;
    name: string;
    google_url: string | null;
    average_rating?: number | null;
    total_reviews?: number | null;
};

/**
 * Pull live rating/review counts from Google Places (same as cron) and persist.
 * Returns whether the competitor row was updated and whether a new snapshot row was written.
 */
export async function applyGooglePlacesMetricsToCompetitor(
    supabase: SupabaseClient,
    competitor: CompetitorRowForMetrics,
    now: Date = new Date()
): Promise<{
    metrics: ExternalCompetitorMetrics | null;
    updated: boolean;
    snapshotInserted: boolean;
}> {
    const live = await fetchCompetitorMetricsFromGoogle({
        name: competitor.name,
        googleUrl: competitor.google_url,
    });

    if (!live) {
        return { metrics: null, updated: false, snapshotInserted: false };
    }

    const currRating = Number(live.averageRating || 0);
    const currReviews = Number(live.totalReviews || 0);

    const { error: updErr } = await supabase
        .from("competitors")
        .update({
            average_rating: currRating,
            total_reviews: currReviews,
            updated_at: now.toISOString(),
        })
        .eq("id", competitor.id);

    if (updErr) {
        console.error("[applyGooglePlacesMetricsToCompetitor] update failed", updErr);
        return { metrics: live, updated: false, snapshotInserted: false };
    }

    const { data: latestRows } = await (supabase.from("competitor_snapshots" as never) as any)
        .select("id, captured_at, average_rating, total_reviews")
        .eq("competitor_id", competitor.id)
        .order("captured_at", { ascending: false })
        .limit(1);

    const latest = (latestRows || [])[0] as
        | { captured_at: string; average_rating: number; total_reviews: number }
        | undefined;

    const prevRating = latest ? Number(latest.average_rating || 0) : Number(competitor.average_rating || 0);
    const prevReviews = latest ? Number(latest.total_reviews || 0) : Number(competitor.total_reviews || 0);
    const ratingDelta = Number((currRating - prevRating).toFixed(1));
    const reviewsDelta = currReviews - prevReviews;
    const sameDay = latest ? sameUtcDay(latest.captured_at, now) : false;
    const unchanged = latest ? ratingDelta === 0 && reviewsDelta === 0 : false;

    if (sameDay && unchanged) {
        return { metrics: live, updated: true, snapshotInserted: false };
    }

    const { error: snapErr } = await (supabase.from("competitor_snapshots" as never) as any).insert({
        competitor_id: competitor.id,
        business_id: competitor.business_id,
        captured_at: now.toISOString(),
        average_rating: currRating,
        total_reviews: currReviews,
        source: "google_places",
        metadata: {
            previous_rating: prevRating,
            previous_reviews: prevReviews,
            rating_delta: ratingDelta,
            reviews_delta: reviewsDelta,
            provider: live.provider,
            provider_place_id: live.placeId,
        },
    });

    if (snapErr) {
        console.error("[applyGooglePlacesMetricsToCompetitor] snapshot insert failed", snapErr);
        return { metrics: live, updated: true, snapshotInserted: false };
    }

    return { metrics: live, updated: true, snapshotInserted: true };
}
