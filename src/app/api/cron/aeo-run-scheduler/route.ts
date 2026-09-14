export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { inngest } from "@/services/inngest/client";
import { runCronJob } from "@/lib/cron/run-cron-job";
import { loadDueBusinesses } from "@/services/aeo/scheduler/load-due-businesses";
import { loadDuePromptEnrollmentBusinesses } from "@/services/aeo/scheduler/load-due-prompt-enrollment-businesses";

/**
 * E-10 fan-out - the trigger the sampling scheduler never had.
 *
 * assignSlot()/planDailyBudget() (sampling-slot.ts, daily-budget.ts) were
 * fully built and tested but had no caller: nothing decided "today, this
 * hour, these businesses" and acted on it. This route is that caller. It
 * decides WHO; aeoRunPlanner (unchanged) still decides WHAT to sample and
 * enforces the daily budget guard per business, same as it always has.
 *
 * Hourly, not daily, matching DEFAULT_SLOT_HOURS (1-8 UTC): a once-daily
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
 * of what the vendor charged us for it - see billing-constants.ts.
 *
 * Not yet registered with any scheduler, including Vercel Cron. The route
 * exists and is reachable but nothing calls it, the same posture E-9.1's
 * credit-reset route had before its own registration was a separate,
 * explicit step.
 */
export async function GET(request: Request) {
    return runCronJob(request, { name: "aeo-run-scheduler", cadence: "hourly" }, async ({ occurrenceKey }) => {
        try {
            const db = createAdminClient();
            const now = new Date();
            const [due, promptEnrollment] = await Promise.all([
                loadDueBusinesses(db, now),
                loadDuePromptEnrollmentBusinesses(db, now),
            ]);

            const events = [
                ...promptEnrollment.map((business) => ({
                    id: `cron:aeo-run-scheduler:enroll:${occurrenceKey}:${business.businessId}`,
                    name: "aeo/prompt-enrollment.requested" as const,
                    data: business,
                })),
                ...due.map((business) => ({
                    id: `cron:aeo-run-scheduler:${occurrenceKey}:${business.businessId}`,
                    name: "aeo/run.requested" as const,
                    data: {
                        ...business,
                        trigger: "scheduled" as const,
                        scheduledFor: now.toISOString(),
                    },
                })),
            ];

            if (events.length > 0) await inngest.send(events);

            return NextResponse.json({
                success: true,
                dispatched: due.length,
                promptEnrollmentRequested: promptEnrollment.length,
            });
        } catch (error: unknown) {
            logger.error({ err: error }, "[cron/aeo-run-scheduler] fan-out failed:");
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    });
}
