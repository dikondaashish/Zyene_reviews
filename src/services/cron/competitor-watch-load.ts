import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchAllReviewRowsPaginated } from "@/lib/reviews/fetch-reviews-paginated";
import { DEFAULT_RATING_ALERT_DELTA, DEFAULT_REVIEW_SPIKE_THRESHOLD } from "./competitor-watch-helpers";
import { loadCompetitorSnapshotHistory } from "./competitor-watch-snapshots";
import type { CompetitorWatchScanState } from "./competitor-watch-types";

export type CompetitorRow = {
    id: string;
    business_id: string;
    name: string;
    google_url: string | null;
    average_rating: number | null;
    total_reviews: number | null;
};

export type CompetitorWatchLoadResult =
    | { kind: "empty" }
    | { kind: "ready"; competitors: CompetitorRow[]; scanState: CompetitorWatchScanState };

/**
 * Everything one business's Competitor Watch scan needs. Scoped to a single business
 * (one Inngest run each), so no read spans every tenant. Throws on a read error so the
 * Inngest step retries instead of scanning against a missing baseline.
 */
export async function loadCompetitorWatchScanContext(
    admin: SupabaseClient,
    now: Date,
    businessId: string,
): Promise<CompetitorWatchLoadResult> {
    const { data: competitors, error: competitorsErr } = await fetchAllReviewRowsPaginated<CompetitorRow>(
        1000,
        (from, to) =>
            admin
                .from("competitors")
                .select("id, business_id, name, google_url, average_rating, total_reviews")
                .eq("business_id", businessId)
                .order("created_at", { ascending: false })
                .order("id", { ascending: true })
                .range(from, to),
    );
    if (competitorsErr) throw new Error(`competitors fetch failed: ${competitorsErr.message}`);
    if (competitors.length === 0) return { kind: "empty" };

    const { data: settingsRow, error: settingsErr } = await admin
        .from("competitor_watch_settings")
        .select("business_id, rating_alert_delta, review_spike_threshold, email_alerts_enabled")
        .eq("business_id", businessId)
        .maybeSingle();
    if (settingsErr) throw new Error(`competitor watch settings fetch failed: ${settingsErr.message}`);

    const settingsByBusiness: CompetitorWatchScanState["settingsByBusiness"] = new Map();
    if (settingsRow) {
        const row = settingsRow as {
            rating_alert_delta: number | null;
            review_spike_threshold: number | null;
            email_alerts_enabled?: boolean | null;
        };
        settingsByBusiness.set(businessId, {
            rating_alert_delta: Number(row.rating_alert_delta ?? DEFAULT_RATING_ALERT_DELTA),
            review_spike_threshold: Number(row.review_spike_threshold ?? DEFAULT_REVIEW_SPIKE_THRESHOLD),
            email_alerts_enabled: row.email_alerts_enabled !== false,
        });
    }

    const { data: businessRow } = await admin
        .from("businesses")
        .select("id, organization_id")
        .eq("id", businessId)
        .maybeSingle();
    const orgByBusiness = new Map<string, string>();
    const orgId = (businessRow as { organization_id?: string | null } | null)?.organization_id;
    if (orgId) orgByBusiness.set(businessId, orgId);

    const { latestByCompetitor, recentByCompetitor } = await loadCompetitorSnapshotHistory(
        admin,
        competitors.map((c) => c.id),
    );

    const scanState: CompetitorWatchScanState = {
        admin,
        now,
        settingsByBusiness,
        orgByBusiness,
        latestByCompetitor,
        recentByCompetitor,
        snapshotsToInsert: [],
        eventsToInsert: [],
        appEventsToInsert: [],
        alertEmailQueue: [],
        insightInputByCompetitor: new Map(),
        businessExternalUpdates: new Map(),
        externalUpdates: 0,
    };

    return { kind: "ready", competitors, scanState };
}
