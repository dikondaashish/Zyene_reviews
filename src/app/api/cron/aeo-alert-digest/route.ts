export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { inngest } from "@/services/inngest/client";
import { runCronJob } from "@/lib/cron/run-cron-job";

const PAGE_SIZE = 1000;

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
            // PostgREST caps a response at 1000 rows, so a single read would
            // silently drop every business past the first 1000 pending alerts.
            // Page with a stable order until a short page comes back.
            const ids = new Set<string>();
            for (let from = 0; ; from += PAGE_SIZE) {
                const { data: rows, error } = await admin
                    .from("aeo_alerts")
                    .select("id, business_id")
                    .is("digest_sent_at", null)
                    .is("muted_at", null)
                    .order("id", { ascending: true })
                    .range(from, from + PAGE_SIZE - 1);
                if (error) throw new Error(error.message);
                for (const row of rows ?? []) ids.add(row.business_id);
                if ((rows ?? []).length < PAGE_SIZE) break;
            }

            const businessIds = [...ids];
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
