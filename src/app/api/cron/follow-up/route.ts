import { createAdminClient } from "@/lib/db/supabase/admin";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { inngest } from "@/services/inngest/client";
import { pingFollowUpHeartbeat } from "@/lib/monitoring/follow-up-heartbeat";
import { isAuthorizedCronRequest } from "@/lib/cron/authorize-cron-request";

/**
 * Fan-out follow-up processing for active campaigns with follow-ups enabled.
 * Schedule externally (e.g. daily) with `Authorization: Bearer CRON_SECRET`.
 *
 * Heartbeat: pings Better Stack on success even when there are zero campaigns, so quiet days
 * do not look like outages. Set `BETTERSTACK_FOLLOW_UP_HEARTBEAT_URL` and align the monitor interval
 * with how often this route runs.
 */
export async function GET(request: Request) {
    if (!isAuthorizedCronRequest(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const admin = createAdminClient();

        console.log("[Cron] Starting automated follow-up sequence check");

        // 1. Fetch campaigns that have follow-ups enabled
        const { data: campaigns, error: campaignError } = await admin
            .from("campaigns")
            .select("id, follow_up_enabled, follow_up_delay_hours, channel, follow_up_template, businesses (id, name, logo_url)")
            .eq("status", "active")
            .eq("follow_up_enabled", true);

        if (campaignError) throw campaignError;

        if (!campaigns || campaigns.length === 0) {
            // Cron ran successfully; still ping so Better Stack does not treat “no work” as downtime.
            await pingFollowUpHeartbeat(true);
            return NextResponse.json({ success: true, processed: 0, message: "No active follow-up campaigns found" });
        }

        console.log(`[Cron] Dispatching follow-ups for ${campaigns.length} campaigns`);

        // 2. Dispatch background jobs via Inngest
        await inngest.send(
            campaigns.map((c) => ({
                name: "cron/follow-up.campaign",
                data: { campaignId: c.id },
            }))
        );

        await pingFollowUpHeartbeat(true);

        return NextResponse.json({
            success: true,
            dispatched: campaigns.length,
            message: "Follow-up background jobs fanned out"
        });
    } catch (error: unknown) {
        console.error("[Cron] Follow-up job failed:", error);
        await pingFollowUpHeartbeat(false);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
