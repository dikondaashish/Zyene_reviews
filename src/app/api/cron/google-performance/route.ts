export const dynamic = "force-dynamic";

import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { inngest } from "@/services/inngest/client";
import { syncGooglePerformanceForPlatform } from "@/services/google/performance-sync";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { isAuthorizedCronRequest } from "@/lib/cron/authorize-cron-request";

/**
 * Daily job: sync Google Business Profile Performance API metrics + search keywords
 * for every active Google `review_platforms` row.
 *
 * Schedule in Vercel: e.g. `0 3 * * *` (03:00 UTC) with `Authorization: Bearer CRON_SECRET`.
 */
export async function GET(request: Request) {
    if (!isAuthorizedCronRequest(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const mode = url.searchParams.get("mode");

    // Optional direct mode for manual debugging only.
    if (mode === "direct") {
        const admin = createAdminClient();
        const { data: platforms, error } = await admin
            .from("review_platforms")
            .select("id, sync_status")
            .eq("platform", "google")
            .neq("sync_status", "running")
            .not("sync_status", "like", "error%")
            .not("google_location_id", "is", null)
            .limit(1);

        if (error) {
            logger.error({ err: error }, "[Cron google-performance] fetch platforms (direct)");
            Sentry.captureException(error);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
        const p = platforms?.[0];
        if (!p) {
            return NextResponse.json({ success: true, queued: false, reason: "no-platforms" });
        }
        const r = await syncGooglePerformanceForPlatform(p.id);
        return NextResponse.json({
            success: true,
            mode: "direct",
            platformId: p.id,
            performanceOk: r.success,
            emptyDailySeries: r.emptyDailySeries,
            dailyRowsUpserted: r.dailyRowsUpserted,
            keywordRowsUpserted: r.keywordRowsUpserted,
            performanceError: r.error,
        });
    }

    try {
        const evt = await inngest.send({
            name: "cron/google-performance.run",
            data: { trigger: "cron-jobs.org" },
        });
        return NextResponse.json({
            success: true,
            queued: true,
            mode: "inngest",
            eventId: evt.ids?.[0] ?? null,
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        logger.error({ err: msg }, "[Cron google-performance] enqueue failed:");
        Sentry.captureException(e);
        return NextResponse.json({ error: "Failed to queue job", details: msg }, { status: 500 });
    }
}
