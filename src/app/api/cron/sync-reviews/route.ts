import { createAdminClient } from "@/lib/db/supabase/admin";
export const dynamic = "force-dynamic";

import { syncGoogleReviewsForPlatform, SyncResult } from "@/services/google/sync-service";
import { syncYelpReviewsForPlatform, YelpSyncResult } from "@/services/yelp/sync-service";
import { syncFacebookReviewsForPlatform, FacebookSyncResult } from "@/services/facebook/sync-service";
import { inngest } from "@/services/inngest/client";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: Request) {
    // Verify Cron Secret — always required
    const authHeader = request.headers.get("authorization");
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();

    // Fetch all active review platforms (Google, Yelp, Facebook)
    const { data: platforms, error } = await admin
        .from("review_platforms")
        .select("id, platform")
        .eq("sync_status", "active")
        .in("platform", ["google", "yelp", "facebook"]);

    if (error) {
        console.error("Cron: Failed to fetch platforms", error);
        Sentry.captureException(error, { tags: { route: "cron-sync-reviews", step: "fetch_platforms" } });
        // Heartbeat fail ping
        await fetch("https://uptime.betterstack.com/api/v1/heartbeat/6VwMgkdn2vqaoo3NG2wwfeNV/fail").catch(() => { });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    console.log(`[Cron] Dispatching sync for ${platforms?.length || 0} platforms`);

    // 1. Dispatch background jobs via Inngest
    if (platforms && platforms.length > 0) {
        await inngest.send(
            platforms.map((p) => ({
                name: "review/sync.platform",
                data: {
                    platformId: p.id,
                    platformType: p.platform as "google" | "yelp" | "facebook",
                },
            }))
        );
    }

    // 2. Heartbeat success ping!
    // We ping success because the DISPATCHER has successfully fanned out the work.
    await fetch("https://uptime.betterstack.com/api/v1/heartbeat/6VwMgkdn2vqaoo3NG2wwfeNV").catch(() => { });

    return NextResponse.json({
        success: true,
        dispatched: platforms?.length || 0,
        message: "Background synchronization fanned out"
    });
}
