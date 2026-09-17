export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { runCronJob } from "@/lib/cron/run-cron-job";
import { executeCompetitorWatchCron } from "@/services/cron/competitor-watch-run";

export async function GET(request: Request) {
    return runCronJob(
        request,
        {
            name: "competitor-watch",
            cadence: "daily",
            leaseSeconds: 1800,
            retryOnInterruption: false,
        },
        () => executeCompetitorWatchCron(request),
    );
}
