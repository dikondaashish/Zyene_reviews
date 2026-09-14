import { NextResponse } from "next/server";
import { pingWeeklyDigestHeartbeat } from "@/lib/monitoring/weekly-digest-heartbeat";
import { runCronJob } from "@/lib/cron/run-cron-job";

export const dynamic = "force-dynamic";

/**
 * Daily Better Stack heartbeat for the weekly digest monitor (no email fan-out).
 *
 * Use when cron-jobs.org (or similar) still hits this legacy path daily while
 * GET /api/cron/weekly-digest runs weekly for actual digest emails.
 */
export async function GET(request: Request) {
    return runCronJob(request, { name: "daily-digest", cadence: "daily" }, async () => {
        await pingWeeklyDigestHeartbeat(true);

        return NextResponse.json({
            ok: true,
            heartbeat: true,
            message: "Digest heartbeat recorded. Fan-out emails via GET /api/cron/weekly-digest on your weekly schedule.",
        });
    });
}
