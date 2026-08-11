export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { inngest } from "@/services/inngest/client";
import { isAuthorizedCronRequest } from "@/lib/cron/authorize-cron-request";
import { loadYearlyResetCandidates } from "@/services/aeo/billing/load-yearly-reset-candidates";

/**
 * E-9.1 fan-out. Schedule externally exactly like the other /api/cron/* routes
 * in this repo (see scripts/ensure-cron-job-*.mjs for the pattern): daily,
 * any time, GET with Authorization: Bearer CRON_SECRET.
 *
 * Not yet registered with an external scheduler — this route exists and is
 * reachable, but nothing calls it until that registration happens, which is a
 * separate, deliberate step alongside flipping AEO_METERED_BILLING_LIVE.
 *
 * No Better Stack heartbeat, unlike the review-sync crons: this fan-out is a
 * no-op today (the worker's first line is the metered-billing flag) and
 * monitoring an intentionally-inert job would only be noise until launch.
 */
export async function GET(request: Request) {
    if (!isAuthorizedCronRequest(request)) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const db = createAdminClient();
        const candidates = await loadYearlyResetCandidates(db, new Date());

        if (candidates.length > 0) {
            await inngest.send(
                candidates.map((c) => ({
                    name: "aeo/credit-reset.requested" as const,
                    data: { organizationId: c.organizationId, grantedMicroUsd: c.grantedMicroUsd },
                }))
            );
        }

        return NextResponse.json({ success: true, dispatched: candidates.length });
    } catch (error: unknown) {
        logger.error({ err: error }, "[cron/aeo-yearly-credit-reset] fan-out failed:");
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
