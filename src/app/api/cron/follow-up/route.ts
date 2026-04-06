import { createAdminClient } from "@/lib/db/supabase/admin";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { inngest } from "@/services/inngest/client";
import { sendReviewRequest } from "@/lib/notifications/review-request";

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

        console.log(`[Cron] Dispatching follow-ups for ${campaigns.length} campaigns`);

        // 2. Dispatch background jobs via Inngest
        if (campaigns && campaigns.length > 0) {
            await inngest.send(
                campaigns.map((c) => ({
                    name: "cron/follow-up.campaign",
                    data: { campaignId: c.id },
                }))
            );
        }

        // 3. Heartbeat success ping!
        await fetch("https://uptime.betterstack.com/api/v1/heartbeat/qaTkuG86YMyWVZNXgeBDtGWc").catch(() => { });

        return NextResponse.json({
            success: true,
            dispatched: campaigns.length,
            message: "Follow-up background jobs fanned out"
        });
    } catch (error: unknown) {
        console.error("[Cron] Follow-up job failed:", error);
        // Heartbeat fail ping
        await fetch("https://uptime.betterstack.com/api/v1/heartbeat/qaTkuG86YMyWVZNXgeBDtGWc/fail").catch(() => { });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
