export const dynamic = "force-dynamic";
/** The route only lists businesses and dispatches one Inngest run each; the scans happen there. */
export const maxDuration = 60;

import { runCronJob } from "@/lib/cron/run-cron-job";
import { executeCompetitorWatchCron } from "@/services/cron/competitor-watch-run";

export async function GET(request: Request) {
    return runCronJob(
        request,
        {
            name: "competitor-watch",
            cadence: "daily",
            leaseSeconds: 300,
            // Safe to rerun: every dispatched event has a per-business, per-day id,
            // so Inngest drops duplicates and no business is scanned or emailed twice.
            retryOnInterruption: true,
        },
        ({ occurrenceKey }) => executeCompetitorWatchCron(occurrenceKey),
    );
}
