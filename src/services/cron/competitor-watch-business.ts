import type { SupabaseClient } from "@supabase/supabase-js";
import type { CompetitorAlertEmailPayload } from "@/lib/notifications/send-competitor-alert-email";
import { loadCompetitorWatchScanContext, type CompetitorRow } from "./competitor-watch-load";
import { processCompetitorWatchRow } from "./competitor-watch-process-row";
import { placesUnavailableCompetitorIds } from "./competitor-watch-row-metrics";
import type { CompetitorInsightInput, CompetitorWatchRow } from "./competitor-watch-finish";

export const COMPETITOR_WATCH_BUSINESS_EVENT = "cron/competitor-watch.business" as const;

/** Google Places calls in flight at once for one business; each has its own timeout. */
const ROW_CONCURRENCY = 4;

/** JSON-safe on purpose: it is the memoised output of an Inngest step. */
export type CompetitorWatchBusinessScan = {
    scanned: number;
    externalUpdates: number;
    /** Rows to write in later steps; the scan step itself writes no snapshot or event. */
    snapshots: CompetitorWatchRow[];
    events: CompetitorWatchRow[];
    appEvents: CompetitorWatchRow[];
    placesUnavailable: number;
    alertEmails: CompetitorAlertEmailPayload[];
    insightInputs: Array<[string, CompetitorInsightInput]>;
};

async function forEachWithConcurrency<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
    let next = 0;
    const lanes = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (next < items.length) {
            const item = items[next++];
            await fn(item);
        }
    });
    await Promise.all(lanes);
}

/**
 * Reads one business's competitors from Google and works out its snapshots, events and
 * alerts, so one slow tenant can no longer lose the day for everyone else. Writes nothing
 * but the competitors' own current numbers: the worker stores events, then snapshots, in
 * separate steps, so a retry never re-scans against a half-written day. Returns null when
 * the business has no competitors (left since the fan-out).
 */
export async function scanCompetitorWatchBusiness(
    admin: SupabaseClient,
    businessId: string,
    now: Date,
): Promise<CompetitorWatchBusinessScan | null> {
    const loaded = await loadCompetitorWatchScanContext(admin, now, businessId);
    if (loaded.kind === "empty") return null;
    const { competitors, scanState } = loaded;

    await forEachWithConcurrency<CompetitorRow>(competitors, ROW_CONCURRENCY, (competitor) =>
        processCompetitorWatchRow(scanState, competitor),
    );

    return {
        scanned: competitors.length,
        externalUpdates: scanState.externalUpdates,
        snapshots: scanState.snapshotsToInsert,
        events: scanState.eventsToInsert,
        appEvents: scanState.appEventsToInsert,
        placesUnavailable: placesUnavailableCompetitorIds(scanState).length,
        alertEmails: scanState.alertEmailQueue,
        insightInputs: [...scanState.insightInputByCompetitor.entries()],
    };
}
