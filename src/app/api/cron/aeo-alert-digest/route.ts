export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { inngest } from "@/services/inngest/client";
import { runCronJob } from "@/lib/cron/run-cron-job";

/**
 * F8 digest fan-out - every business with at least one undigested,
 * unmuted alert. Deliberately separate from detection: a digest-send retry
 * must never re-run detection (which could create new alerts mid-send), and
 * a detection retry must never re-send an already-delivered email.
 */
export async function GET(request: Request) {
    return runCronJob(request, { name: "aeo-alert-digest", cadence: "daily" }, async ({ occurrenceKey }) => {
        try {
            const admin = createAdminClient();
            const { data: rows, error } = await admin
                .from("aeo_alerts")
                .select("business_id")
                .is("digest_sent_at", null)
                .is("muted_at", null);

            if (error) throw new Error(error.message);

            const businessIds = [...new Set((rows ?? []).map((r) => r.business_id))];
            if (businessIds.length === 0) {
                return NextResponse.json({ success: true, dispatched: 0 });
            }

            await inngest.send(
                businessIds.map((businessId) => ({
                    id: `cron:aeo-alert-digest:${occurrenceKey}:${businessId}`,
                    name: "cron/aeo-alert-digest.business" as const,
                    data: { businessId },
                })),
            );

            return NextResponse.json({
                success: true,
                dispatched: businessIds.length,
            });
        } catch (error: unknown) {
            logger.error({ err: error }, "[cron/aeo-alert-digest] fan-out failed:");
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    });
}
