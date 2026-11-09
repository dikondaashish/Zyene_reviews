import type { SupabaseClient } from "@supabase/supabase-js";
import type { CompetitorWatchScanState } from "./competitor-watch-types";

/** About two weeks of daily snapshots: enough to find the other side of a flip-flopping count. */
export const RECENT_SNAPSHOTS_FOR_ALERTS = 14;
const PAGE_SIZE = 1000;
/** Safety bound: no business needs more history than this to find each competitor's recent snapshots. */
const MAX_PAGES = 50;

type SnapshotRow = {
    id: string;
    competitor_id: string;
    captured_at: string;
    average_rating: number;
    total_reviews: number;
    metadata: Record<string, unknown> | null;
};

type LatestSnapshot = CompetitorWatchScanState["latestByCompetitor"] extends Map<string, infer V> ? V : never;

/**
 * Latest and recent snapshots for the given competitors, newest first. Pages with
 * `.range()` because PostgREST returns at most 1000 rows per request: a single read
 * silently dropped competitors past that cap, so they had no baseline and never alerted.
 * Stops early once every competitor has its recent window.
 */
export async function loadCompetitorSnapshotHistory(
    admin: SupabaseClient,
    competitorIds: string[],
): Promise<{
    latestByCompetitor: CompetitorWatchScanState["latestByCompetitor"];
    recentByCompetitor: CompetitorWatchScanState["recentByCompetitor"];
}> {
    const latestByCompetitor = new Map<string, LatestSnapshot>();
    const recentByCompetitor: CompetitorWatchScanState["recentByCompetitor"] = new Map();
    if (competitorIds.length === 0) return { latestByCompetitor, recentByCompetitor };

    const complete = () =>
        competitorIds.every((id) => (recentByCompetitor.get(id)?.length ?? 0) >= RECENT_SNAPSHOTS_FOR_ALERTS);

    for (let page = 0; page < MAX_PAGES; page++) {
        const from = page * PAGE_SIZE;
        const { data, error } = await admin
            .from("competitor_snapshots")
            .select("id, competitor_id, captured_at, average_rating, total_reviews, metadata")
            .in("competitor_id", competitorIds)
            .order("captured_at", { ascending: false })
            .order("id", { ascending: false })
            .range(from, from + PAGE_SIZE - 1);
        if (error) throw new Error(`competitor snapshots fetch failed: ${error.message}`);

        const rows = (data ?? []) as SnapshotRow[];
        for (const row of rows) {
            const recent = recentByCompetitor.get(row.competitor_id) ?? [];
            if (recent.length < RECENT_SNAPSHOTS_FOR_ALERTS) {
                recent.push({ average_rating: row.average_rating, total_reviews: row.total_reviews });
                recentByCompetitor.set(row.competitor_id, recent);
            }
            if (!latestByCompetitor.has(row.competitor_id)) {
                const placeId = row.metadata?.provider_place_id;
                latestByCompetitor.set(row.competitor_id, {
                    id: row.id,
                    competitor_id: row.competitor_id,
                    captured_at: row.captured_at,
                    average_rating: row.average_rating,
                    total_reviews: row.total_reviews,
                    provider_place_id: typeof placeId === "string" ? placeId : null,
                });
            }
        }
        if (rows.length < PAGE_SIZE || complete()) break;
    }
    return { latestByCompetitor, recentByCompetitor };
}
