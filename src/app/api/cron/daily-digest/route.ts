import { NextResponse } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/cron/authorize-cron-request";
import { pingWeeklyDigestHeartbeat } from "@/lib/monitoring/weekly-digest-heartbeat";

export const dynamic = "force-dynamic";

/**
 * Daily Better Stack heartbeat for the weekly digest monitor (no email fan-out).
 *
 * Use when cron-jobs.org (or similar) still hits this legacy path daily while
 * GET /api/cron/weekly-digest runs weekly for actual digest emails.
 */
export async function GET(request: Request) {
    if (!isAuthorizedCronRequest(request)) {
        await pingWeeklyDigestHeartbeat(false);
        return new NextResponse("Unauthorized", { status: 401 });
    }

    await pingWeeklyDigestHeartbeat(true);

    return NextResponse.json({
        ok: true,
        heartbeat: true,
        message:
            "Digest heartbeat recorded. Fan-out emails via GET /api/cron/weekly-digest on your weekly schedule.",
    });
}
