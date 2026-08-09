export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { inngest } from "@/services/inngest/client";
import { isAuthorizedCronRequest } from "@/lib/cron/authorize-cron-request";
import { loadDueBusinesses } from "@/services/aeo/scheduler/load-due-businesses";

/**
 * E-10 fan-out — the trigger the sampling scheduler never had.
 *
 * assignSlot()/planDailyBudget() (sampling-slot.ts, daily-budget.ts) were
 * fully built and tested but had no caller: nothing decided "today, this
 * hour, these businesses" and acted on it. This route is that caller. It
 * decides WHO; aeoRunPlanner (unchanged) still decides WHAT to sample and
 * enforces the daily budget guard per business, same as it always has.
 *
 * Hourly, not daily, matching DEFAULT_SLOT_HOURS (1–8 UTC): a once-daily
 * fire would dispatch a whole day's businesses at once, recreating the
 * thundering herd the (day, hour) split exists to prevent.
 *
 * Deliberately conservative on its first wiring: no engineIds is passed, so
 * aeoRunPlanner falls back to its own DEFAULT_ENGINES (Gemini only, free-tier
 * capped), and overageAuthorised is never set, so the E-10 budget guard
 * cannot authorise vendor-side spend past a free allowance on its own. This
 * caps today's real financial exposure to Gemini's free daily bucket at the
 * vendor side. It does NOT cap E-9's customer-facing side: one dispatch unit
 * settling "ok" still costs $2.50 in AEO credit or Stripe overage regardless
 * of what the vendor charged us for it — see billing-constants.ts.
 *
 * Not yet registered with any scheduler, including Vercel Cron. The route
 * exists and is reachable but nothing calls it, the same posture E-9.1's
 * credit-reset route had before its own registration was a separate,
 * explicit step.
 */
export async function GET(request: Request) {
    if (!isAuthorizedCronRequest(request)) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const db = createAdminClient();
        const now = new Date();
        const due = await loadDueBusinesses(db, now);

        if (due.length > 0) {
            await inngest.send(
                due.map((d) => ({
                    name: "aeo/run.requested" as const,
                    data: {
                        businessId: d.businessId,
                        organizationId: d.organizationId,
                        trigger: "scheduled" as const,
                        scheduledFor: now.toISOString(),
                    },
                }))
            );
        }

        return NextResponse.json({ success: true, dispatched: due.length });
    } catch (error: unknown) {
        logger.error({ err: error }, "[cron/aeo-run-scheduler] fan-out failed:");
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
