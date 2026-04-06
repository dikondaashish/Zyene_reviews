import { createAdminClient } from "@/lib/db/supabase/admin";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { inngest } from "@/services/inngest/client";

export async function GET(request: Request) {
    // Verify Cron Secret — always required
    const authHeader = request.headers.get("authorization");
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
            return NextResponse.json({ success: true, processed: 0, message: "No active follow-up campaigns found" });
        }

        let totalEnqueued = 0;

        for (const campaign of campaigns) {
            if (!campaign.businesses) continue;

            const delayHours = campaign.follow_up_delay_hours || 72; // Default 3 days
            const cutoffTime = new Date();
            cutoffTime.setHours(cutoffTime.getHours() - delayHours);

            // 2. Find eligible review requests for this campaign
            const { data: eligibleRequests, error: requestError } = await admin
                .from("review_requests")
                .select("id")
                .eq("campaign_id", campaign.id)
                .eq("status", "delivered")
                .eq("review_left", false)
                .eq("is_follow_up_sent", false)
                .lt("sent_at", cutoffTime.toISOString())
                .limit(100); // 100 per campaign per run

            if (!eligibleRequests || eligibleRequests.length === 0) continue;

            // 3. Dispatch follow-ups via Inngest
            await inngest.send(
                eligibleRequests.map((req) => ({
                    name: "campaign/follow-up.dispatch",
                    data: {
                        requestId: req.id,
                        campaignId: campaign.id,
                    },
                }))
            );

            totalEnqueued += eligibleRequests.length;
        }

        // Heartbeat success ping!
        // We ping success because the DISPATCHER has successfully fanned out the work.
        await fetch("https://uptime.betterstack.com/api/v1/heartbeat/qaTkuG86YMyWVZNXgeBDtGWc").catch(() => { });

        return NextResponse.json({
            success: true,
            campaignsProcessed: campaigns.length,
            followUpsEnqueued: totalEnqueued
        });

    } catch (error: unknown) {
        console.error("[Cron] Follow-up job failed:", error);
        // Heartbeat fail ping
        await fetch("https://uptime.betterstack.com/api/v1/heartbeat/qaTkuG86YMyWVZNXgeBDtGWc/fail").catch(() => { });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
