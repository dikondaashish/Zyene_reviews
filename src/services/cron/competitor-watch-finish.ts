import { logger } from "@/lib/logger";
import { generateCompetitorInsight } from "@/domains/ai/services/generate-competitor-insight";
import type { SupabaseClient } from "@supabase/supabase-js";

export type CompetitorInsightInput = {
    competitorName: string;
    businessId: string;
    ratingNow: number;
    reviewsNow: number;
    ratingDelta: number;
    reviewsDelta: number;
    events: Array<{ title: string; summary?: string | null; delta?: number | null }>;
};

export type CompetitorWatchRunStatus = "success" | "partial" | "failed";

/**
 * "success" only when every competitor was read live from Google. When Places is down
 * or has no key, the scan only has stored numbers, so the page must not say "Updated
 * from Google": all-unavailable is "failed" (shows the failure banner), some is "partial".
 */
export function competitorWatchRunStatus(scanned: number, placesUnavailable: number): CompetitorWatchRunStatus {
    if (scanned > 0 && placesUnavailable >= scanned) return "failed";
    if (placesUnavailable > 0) return "partial";
    return "success";
}

export type CompetitorWatchRow = Record<string, unknown>;

/**
 * Change events first, in their own Inngest step: each insert is one statement, so a
 * failure writes nothing and the retry (with the memoised scan) loses no event. Writing
 * the snapshot first used to make a retry see "already captured today" and drop the
 * day's events and alerts. Throws so the step retries.
 */
export async function recordCompetitorWatchEvents(
    admin: SupabaseClient,
    events: CompetitorWatchRow[],
    appEvents: CompetitorWatchRow[],
): Promise<number> {
    if (events.length > 0) {
        const { error } = await admin.from("competitor_events").insert(events);
        if (error) throw new Error(`competitor events insert failed: ${error.message}`);
    }
    if (appEvents.length > 0) {
        const { error } = await admin.from("events").insert(appEvents);
        if (error) logger.error({ err: error }, "[competitor-watch] app events insert failed:");
    }
    return events.length;
}

/** Snapshots last, in their own step, after events are stored. Throws so the step retries. */
export async function recordCompetitorWatchSnapshots(admin: SupabaseClient, snapshots: CompetitorWatchRow[]): Promise<number> {
    if (snapshots.length === 0) return 0;
    const { error } = await admin.from("competitor_snapshots").insert(snapshots);
    if (error) throw new Error(`competitor snapshots insert failed: ${error.message}`);
    return snapshots.length;
}

/** AI write-ups for meaningful moves. Best effort: a failed insight never fails the scan. */
export async function storeCompetitorInsights(
    admin: SupabaseClient,
    now: Date,
    inputs: Array<[string, CompetitorInsightInput]>,
): Promise<number> {
    if (inputs.length === 0) return 0;
    const results = await Promise.all(
        inputs.map(async ([competitorId, input]) => {
            const insight = await generateCompetitorInsight({
                competitorName: input.competitorName,
                ratingNow: input.ratingNow,
                reviewsNow: input.reviewsNow,
                ratingDelta: input.ratingDelta,
                reviewsDelta: input.reviewsDelta,
                events: input.events,
            });
            if (!insight) return null;
            return {
                competitor_id: competitorId,
                business_id: input.businessId,
                range_key: "30d",
                summary: insight.summary,
                priority: insight.priority,
                confidence: Number(insight.confidence.toFixed(2)),
                why_it_matters: insight.whyItMatters,
                owner_suggestion: insight.ownerSuggestion,
                actions: insight.actions,
                recommendations: insight.recommendations,
                model: process.env.GOOGLE_AI_LITE_MODEL?.trim() || "gemini-3.1-flash-lite-preview",
                created_at: now.toISOString(),
            };
        }),
    );
    const rows = results.filter((row): row is NonNullable<typeof row> => row !== null);
    if (rows.length === 0) return 0;
    const { error } = await admin.from("competitor_insights").insert(rows);
    if (error) {
        logger.error({ err: error }, "[competitor-watch] insights insert failed:");
        return 0;
    }
    return rows.length;
}

export type CompetitorWatchRunRow = {
    run_id: string;
    business_id: string;
    status: CompetitorWatchRunStatus;
    scanned: number;
    external_updates: number;
    snapshots_created: number;
    events_created: number;
    insights_created: number;
    error_message: string | null;
    started_at: string;
    finished_at: string;
};

/** The "Last sync" line on the Competitors page reads the newest of these rows. */
export async function insertCompetitorWatchRunRow(admin: SupabaseClient, row: CompetitorWatchRunRow): Promise<void> {
    const { error } = await admin.from("competitor_watch_runs").insert(row);
    if (error) logger.error({ err: error, businessId: row.business_id }, "[competitor-watch] run log insert failed:");
}
