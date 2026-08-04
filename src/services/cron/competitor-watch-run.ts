import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { pingCompetitorWatchHeartbeat } from "@/lib/monitoring/competitor-watch-heartbeat";
import { finalizeCompetitorWatchRun } from "./competitor-watch-finish";
import { loadCompetitorWatchScanContext } from "./competitor-watch-load";
import { processCompetitorWatchRow } from "./competitor-watch-process-row";

export async function executeCompetitorWatchCron(_request: Request) {
    const admin = createAdminClient();
    const now = new Date();
    const runStartedAt = now.toISOString();
    const runId = crypto.randomUUID();
    let lockAcquired = false;
    let processedBusinessIds: string[] = [];

    try {
        const { data: lockResult, error: lockErr } = await admin.rpc("acquire_competitor_watch_lock");
        if (lockErr) {
            logger.error({ err: lockErr }, "[cron/competitor-watch] lock acquire failed:");
            await pingCompetitorWatchHeartbeat(false);
            return NextResponse.json({ error: "Lock acquisition failed" }, { status: 500 });
        }
        if (!lockResult) {
            return NextResponse.json(
                { success: true, skipped: true, reason: "already_running" },
                { status: 200 },
            );
        }
        lockAcquired = true;

        const loaded = await loadCompetitorWatchScanContext(admin, now);
        if (loaded.kind === "error" || loaded.kind === "empty") {
            return loaded.response;
        }

        const { competitors, scanState } = loaded;
        processedBusinessIds = loaded.processedBusinessIds;

        for (const competitor of competitors) {
            await processCompetitorWatchRow(scanState, competitor);
        }

        return finalizeCompetitorWatchRun({
            admin,
            now,
            runId,
            runStartedAt,
            competitors,
            processedBusinessIds,
            snapshotsToInsert: scanState.snapshotsToInsert,
            eventsToInsert: scanState.eventsToInsert,
            appEventsToInsert: scanState.appEventsToInsert,
            alertEmailQueue: scanState.alertEmailQueue,
            insightInputByCompetitor: scanState.insightInputByCompetitor,
            businessExternalUpdates: scanState.businessExternalUpdates,
            externalUpdates: scanState.externalUpdates,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal server error";
        logger.error({ err: error }, "[cron/competitor-watch] unexpected error:");
        if (processedBusinessIds.length > 0) {
            const failureRows = processedBusinessIds.map((businessId) => ({
                run_id: runId,
                business_id: businessId,
                status: "failed",
                scanned: 0,
                external_updates: 0,
                snapshots_created: 0,
                events_created: 0,
                insights_created: 0,
                error_message: message.slice(0, 500),
                started_at: runStartedAt,
                finished_at: new Date().toISOString(),
            }));
            const { error: failInsertErr } = await admin.from("competitor_watch_runs").insert(
                failureRows,
            );
            if (failInsertErr) {
                logger.error({ err: failInsertErr }, "[cron/competitor-watch] failure run log insert failed:");
            }
        }
        await pingCompetitorWatchHeartbeat(false);
        return NextResponse.json({ error: message }, { status: 500 });
    } finally {
        if (lockAcquired) {
            const { error: unlockErr } = await admin.rpc("release_competitor_watch_lock");
            if (unlockErr) {
                logger.error({ err: unlockErr }, "[cron/competitor-watch] lock release failed:");
            }
        }
    }
}
