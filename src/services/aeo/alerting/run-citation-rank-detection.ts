import type { SupabaseClient } from "@supabase/supabase-js";

import { logger } from "@/lib/logger";
import type { Database } from "@/lib/db/supabase/database.types";
import type { SupabaseAlertStore } from "./alert-store";
import { detectCitationAlerts, splitCitationWindows, type CitationFact } from "./detect-citation-alerts";
import { detectRankAlert, type GridCell } from "./detect-rank-alerts";

/**
 * The database-backed halves of F8.2 and F8.3.
 *
 * Split from run-alert-detection.ts to keep both files under the services cap,
 * and because these two are the only detectors that depend on migration
 * 20260818154353 — keeping them together makes that dependency one import to
 * find rather than two blocks to notice.
 */

type Admin = SupabaseClient<Database>;

export type DetectionInput = { businessId: string; organizationId: string };

/** History window for citation comparison. Matches the sampling lookback. */
const CITATION_LOOKBACK_DAYS = 120;

/** Splits citation history into "recent" and "baseline". Two weekly cycles. */
const CITATION_RECENT_WINDOW_DAYS = 14;

/**
 * Runs one detector, absorbing its failure.
 *
 * Only ever wrapped around detectors whose failure is survivable — losing one
 * alert family is strictly better than losing all of them. The error is logged
 * rather than swallowed silently, so a missing migration surfaces as a real
 * signal instead of an unexplained absence of alerts.
 */
export async function safely(label: string, run: () => Promise<number>): Promise<number> {
    try {
        return await run();
    } catch (error) {
        logger.error({ err: error, detector: label }, "[AEO] alert detector failed; continuing with the others");
        return 0;
    }
}


/** F8.2 — our own pages gaining or losing citations. */
export async function detectCitationChanges(
    db: Admin,
    store: SupabaseAlertStore,
    input: DetectionInput
): Promise<number> {
    const lookback = new Date(Date.now() - CITATION_LOOKBACK_DAYS * 86_400_000).toISOString();

    // Joined through the sample so each citation carries the time it was
    // observed; aeo_citations records only its own insert time.
    const { data: rows } = await db
        .from("aeo_citations")
        .select("normalized_url, aeo_samples!inner(sampled_at, business_id, status)")
        .eq("business_id", input.businessId)
        .eq("classification", "own")
        .eq("aeo_samples.status", "ok")
        .gte("aeo_samples.sampled_at", lookback);

    const facts: CitationFact[] = (rows ?? []).flatMap((row) => {
        const sampledAt = (row.aeo_samples as unknown as { sampled_at: string } | null)?.sampled_at;
        return sampledAt ? [{ normalizedUrl: row.normalized_url, sampledAt }] : [];
    });

    if (facts.length === 0) return 0;

    const cutoff = new Date(Date.now() - CITATION_RECENT_WINDOW_DAYS * 86_400_000);
    const alerts = detectCitationAlerts(splitCitationWindows(facts, cutoff));

    let created = 0;
    for (const alert of alerts) {
        const lost = alert.direction === "lost";
        const result = await store.createIfNotCoolingDown({
            businessId: input.businessId,
            organizationId: input.organizationId,
            alertType: lost ? "citation_lost" : "citation_gained",
            severity: lost ? "high" : "low",
            promptId: null,
            engineId: null,
            pageUrl: alert.normalizedUrl,
            title: lost ? "A page stopped being cited" : "A page started being cited",
            detail: lost
                ? `${alert.normalizedUrl} was cited in ${alert.baselineCitations} earlier answers and in none over the last ${CITATION_RECENT_WINDOW_DAYS} days.`
                : `${alert.normalizedUrl} is now cited in ${alert.recentCitations} answers, having never been cited before.`,
            evidence: {
                normalizedUrl: alert.normalizedUrl,
                baselineCitations: alert.baselineCitations,
                recentCitations: alert.recentCitations,
            },
        });
        if (result) created += 1;
    }
    return created;
}

/** F8.3 — local-pack rank movement between the two latest grids of one keyword. */
export async function detectRankMovement(
    db: Admin,
    store: SupabaseAlertStore,
    input: DetectionInput
): Promise<number> {
    const { data: runs } = await db
        .from("aeo_geo_grid_runs")
        .select("id, keyword, status, created_at")
        .eq("business_id", input.businessId)
        .in("status", ["success", "partial"])
        .order("created_at", { ascending: false })
        .limit(10);

    const ordered = runs ?? [];
    if (ordered.length < 2) return 0;

    // Compare the newest run against the most recent EARLIER run of the same
    // keyword. Two different keywords are two different measurements.
    const current = ordered[0];
    const previous = ordered.slice(1).find((r) => r.keyword === current.keyword);
    if (!previous) return 0;

    const [currentPoints, previousPoints] = await Promise.all([
        db.from("aeo_geo_grid_points").select("grid_row, grid_col, rank_position").eq("run_id", current.id),
        db.from("aeo_geo_grid_points").select("grid_row, grid_col, rank_position").eq("run_id", previous.id),
    ]);

    const toCells = (rows: { grid_row: number; grid_col: number; rank_position: number | null }[] | null): GridCell[] =>
        (rows ?? []).map((p) => ({ row: p.grid_row, col: p.grid_col, rankPosition: p.rank_position }));

    const alert = detectRankAlert({
        keyword: current.keyword,
        previousCells: toCells(previousPoints.data),
        currentCells: toCells(currentPoints.data),
    });
    if (!alert) return 0;

    const result = await store.createIfNotCoolingDown({
        businessId: input.businessId,
        organizationId: input.organizationId,
        alertType: "rank_drop",
        severity: "high",
        promptId: null,
        engineId: null,
        pageUrl: null,
        title: `Local rank dropped for "${alert.keyword}"`,
        detail:
            alert.comparedCells > 0
                ? `Average local-pack position went from ${alert.previousAverageRank.toFixed(1)} to ${alert.currentAverageRank.toFixed(1)} across ${alert.comparedCells} comparable grid points${
                      alert.cellsLostFromPack > 0 ? `, and you left the pack entirely in ${alert.cellsLostFromPack}` : ""
                  }.`
                : `You left the local pack entirely in ${alert.cellsLostFromPack} grid points.`,
        evidence: { ...alert },
    });

    return result ? 1 : 0;
}
