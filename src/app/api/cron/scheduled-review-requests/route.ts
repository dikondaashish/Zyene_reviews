import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { processDueScheduledReviewRequests } from "@/lib/review-requests/process-scheduled-queue";
import { isAuthorizedCronRequest } from "@/lib/cron/authorize-cron-request";

/**
 * Sends manually scheduled review requests (`queued` + `scheduled_for` ≤ now).
 *
 * On cron-jobs.org: create a job that GETs your production URL every few minutes
 * (example schedule: `every 5 minutes`), and add header `Authorization: Bearer <CRON_SECRET>` matching
 * the `CRON_SECRET` env var in your app (same pattern as your other cron routes).
 */
export async function GET(request: Request) {
    if (!isAuthorizedCronRequest(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const results = await processDueScheduledReviewRequests({ limit: 40 });
        return NextResponse.json({ success: true, ...results });
    } catch (error: unknown) {
        console.error("[Cron] scheduled-review-requests:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
