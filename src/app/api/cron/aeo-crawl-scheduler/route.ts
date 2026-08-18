export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { inngest } from "@/services/inngest/client";
import { isAuthorizedCronRequest } from "@/lib/cron/authorize-cron-request";
import { loadDueCrawlBusinesses } from "@/services/aeo/scheduler/load-due-crawl-businesses";

/**
 * E-3 fan-out — the trigger the crawler engine never had.
 *
 * Mirrors /api/cron/aeo-run-scheduler exactly: hourly, matching the same
 * (day, hour) slot mechanism (crawl-slot.ts, independently salted from E-10's
 * sampling slot so the two kinds of load spread across different hours).
 * This route decides WHO is due; aeoCrawlWorker decides whether it may
 * actually run (isLiveCrawlingEnabled()) and does the crawling.
 *
 * Registered in vercel.json on the same `0 1-8 * * *` band as the sampling
 * scheduler, because crawl-slot.ts draws its hour from the same 1–8 UTC
 * window — a narrower band would strand every business whose slot fell
 * outside it, silently and permanently.
 *
 * Registration is NOT the same as going live. AEO_LIVE_CRAWLING remains the
 * gate, checked inside aeoCrawlWorker: with it unset this cron fans out
 * events the worker refuses to act on, so no customer domain is ever
 * fetched. Two switches, deliberately independent.
 */
export async function GET(request: Request) {
    if (!isAuthorizedCronRequest(request)) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const db = createAdminClient();
        const due = await loadDueCrawlBusinesses(db, new Date());

        if (due.length > 0) {
            await inngest.send(
                due.map((d) => ({
                    name: "aeo/crawl.requested" as const,
                    data: {
                        businessId: d.businessId,
                        organizationId: d.organizationId,
                        origin: d.origin,
                        planId: d.planId,
                        trigger: "scheduled" as const,
                    },
                }))
            );
        }

        return NextResponse.json({ success: true, dispatched: due.length });
    } catch (error: unknown) {
        logger.error({ err: error }, "[cron/aeo-crawl-scheduler] fan-out failed:");
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
