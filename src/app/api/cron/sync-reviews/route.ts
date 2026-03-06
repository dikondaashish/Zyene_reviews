import { createAdminClient } from "@/lib/supabase/admin";
import { syncGoogleReviewsForPlatform, SyncResult } from "@/lib/google/sync-service";
import { syncYelpReviewsForPlatform, YelpSyncResult } from "@/lib/yelp/sync-service";
import { syncFacebookReviewsForPlatform, FacebookSyncResult } from "@/lib/facebook/sync-service";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: Request) {
    // Verify Cron Secret — always required (no localhost bypass)
    const authHeader = request.headers.get("authorization");
    if (
        process.env.NODE_ENV === "development" &&
        process.env.ALLOW_INSECURE_CRON === "true"
    ) {
        // allow through for local dev only
    } else if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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

    console.log(`[Cron] Starting sync for ${platforms?.length || 0} platforms`);

    const results = [];
    let totalAnalyzed = 0;
    let totalAlerts = 0;

    // Process sequentially to respect rate limits
    for (const platform of platforms || []) {
        try {
            let stats: SyncResult | YelpSyncResult | FacebookSyncResult;

            if (platform.platform === "google") {
                stats = await syncGoogleReviewsForPlatform(platform.id);
            } else if (platform.platform === "yelp") {
                stats = await syncYelpReviewsForPlatform(platform.id);
            } else if (platform.platform === "facebook") {
                stats = await syncFacebookReviewsForPlatform(platform.id);
            } else {
                console.warn(`[Cron] Unknown platform type: ${platform.platform}`);
                continue;
            }

            totalAnalyzed += stats.analyzed || 0;
            totalAlerts += stats.alerts || 0;
            results.push({ id: platform.id, platform: platform.platform, status: "success", ...stats });
        } catch (error: any) {
            console.error(`[Cron] Sync Failed for ${platform.platform} platform ${platform.id}:`, error);
            Sentry.captureException(error, {
                tags: { route: "cron-sync-reviews", platform: platform.platform },
                extra: { platform_id: platform.id }
            });
            results.push({ id: platform.id, platform: platform.platform, status: "error", error: "Internal Server Error" });
        }
    }

    // Heartbeat success ping!
    await fetch("https://uptime.betterstack.com/api/v1/heartbeat/6VwMgkdn2vqaoo3NG2wwfeNV").catch(() => { });

    return NextResponse.json({
        success: true,
        processed: results.length,
        totalAnalyzed,
        totalAlerts,
        results
    });
}
