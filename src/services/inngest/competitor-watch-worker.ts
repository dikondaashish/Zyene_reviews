import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { sendCompetitorAlertEmail } from "@/lib/notifications/send-competitor-alert-email";
import { pingCompetitorWatchHeartbeat } from "@/lib/monitoring/competitor-watch-heartbeat";
import { inngest } from "@/services/inngest/client";
import {
    COMPETITOR_WATCH_BUSINESS_EVENT,
    scanCompetitorWatchBusiness,
} from "@/services/cron/competitor-watch-business";
import {
    competitorWatchRunStatus,
    insertCompetitorWatchRunRow,
    recordCompetitorWatchEvents,
    recordCompetitorWatchSnapshots,
    storeCompetitorInsights,
} from "@/services/cron/competitor-watch-finish";

function businessIdOf(data: unknown): string | null {
    const id = (data as { businessId?: unknown } | null)?.businessId;
    return typeof id === "string" && id ? id : null;
}

/**
 * Competitor Watch for one business, dispatched once a day by /api/cron/competitor-watch.
 * Each step is memoised, so a retry never re-sends an alert email that already went out,
 * and the per-business-per-day event id stops a second run for the same day.
 *
 * The heartbeat is pinged from here, not from the fan-out: "events accepted" says nothing
 * about whether any scan ran (an un-synced Inngest app, a Supabase outage). A finished
 * scan pings success; an exhausted run or a scan with no Google data pings failure.
 */
export const competitorWatchBusinessWorker = inngest.createFunction(
    {
        id: "competitor-watch-business-worker",
        name: "Competitor Watch (one business)",
        retries: 2,
        // One scan per business at a time, and a global cap to stay inside Places quotas.
        concurrency: [{ key: "event.data.businessId", limit: 1 }, { limit: 10 }],
        onFailure: async ({ event, error }) => {
            const businessId = businessIdOf(event.data.event.data);
            if (!businessId) return;
            const at = new Date().toISOString();
            await insertCompetitorWatchRunRow(createAdminClient(), {
                run_id: crypto.randomUUID(), business_id: businessId, status: "failed",
                scanned: 0, external_updates: 0, snapshots_created: 0, events_created: 0, insights_created: 0,
                error_message: (error?.message ?? "Competitor Watch failed").slice(0, 500),
                started_at: at, finished_at: at,
            });
            await pingCompetitorWatchHeartbeat(false);
        },
    },
    { event: COMPETITOR_WATCH_BUSINESS_EVENT },
    async ({ event, step }) => {
        const businessId = businessIdOf(event.data);
        if (!businessId) return { skipped: "missing_business_id" as const };

        const start = await step.run("start", () => ({
            runId: crypto.randomUUID(),
            startedAt: new Date().toISOString(),
        }));

        const scan = await step.run("scan", () =>
            scanCompetitorWatchBusiness(createAdminClient(), businessId, new Date(start.startedAt)),
        );
        if (!scan) return { skipped: "no_competitors" as const };

        const eventsCreated = await step.run("record-events", () =>
            recordCompetitorWatchEvents(createAdminClient(), scan.events, scan.appEvents),
        );
        const snapshotsCreated = await step.run("record-snapshots", () =>
            recordCompetitorWatchSnapshots(createAdminClient(), scan.snapshots),
        );

        for (let i = 0; i < scan.alertEmails.length; i++) {
            await step.run(`alert-email-${i}`, async () => {
                try {
                    await sendCompetitorAlertEmail(scan.alertEmails[i]);
                } catch (err: unknown) {
                    // Not rethrown: a retry would email the members who already got it.
                    logger.error({ err, businessId }, "[competitor-watch] alert email failed:");
                }
            });
        }

        const insightsCreated = await step.run("insights", () =>
            storeCompetitorInsights(createAdminClient(), new Date(start.startedAt), scan.insightInputs),
        );

        const status = competitorWatchRunStatus(scan.scanned, scan.placesUnavailable);
        await step.run("record-run", async () => {
            await insertCompetitorWatchRunRow(createAdminClient(), {
                run_id: start.runId,
                business_id: businessId,
                status,
                scanned: scan.scanned,
                external_updates: scan.externalUpdates,
                snapshots_created: snapshotsCreated,
                events_created: eventsCreated,
                insights_created: insightsCreated,
                error_message: scan.placesUnavailable > 0
                    ? `Google Places data unavailable for ${scan.placesUnavailable} of ${scan.scanned} competitors`
                    : null,
                started_at: start.startedAt,
                finished_at: new Date().toISOString(),
            });
            await pingCompetitorWatchHeartbeat(status !== "failed");
        });

        return {
            businessId, status, scanned: scan.scanned, snapshotsCreated,
            eventsCreated, alertEmails: scan.alertEmails.length, insightsCreated,
        };
    },
);
