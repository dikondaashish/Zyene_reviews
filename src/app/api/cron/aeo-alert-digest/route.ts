export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { inngest } from "@/services/inngest/client";
import { isAuthorizedCronRequest } from "@/lib/cron/authorize-cron-request";

/**
 * F8 digest fan-out — every business with at least one undigested,
 * unmuted alert. Deliberately separate from detection: a digest-send retry
 * must never re-run detection (which could create new alerts mid-send), and
 * a detection retry must never re-send an already-delivered email.
 */
export async function GET(request: Request) {
    if (!isAuthorizedCronRequest(request)) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

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
                name: "cron/aeo-alert-digest.business" as const,
                data: { businessId },
            }))
        );

        return NextResponse.json({ success: true, dispatched: businessIds.length });
    } catch (error: unknown) {
        logger.error({ err: error }, "[cron/aeo-alert-digest] fan-out failed:");
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
