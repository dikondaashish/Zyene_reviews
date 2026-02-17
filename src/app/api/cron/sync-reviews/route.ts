import { createAdminClient } from "@/lib/supabase/admin";
import { syncGoogleReviewsForPlatform, SyncResult } from "@/lib/google/sync-service";
import { syncYelpReviewsForPlatform, YelpSyncResult } from "@/lib/yelp/sync-service";
import { syncFacebookReviewsForPlatform, FacebookSyncResult } from "@/lib/facebook/sync-service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    // Verify Cron Secret
    const authHeader = request.headers.get("authorization");
    const isLocal = request.headers.get("host")?.includes("localhost");

    if (!isLocal && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
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
        return NextResponse.json({ error: error.message }, { status: 500 });
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
            results.push({ id: platform.id, platform: platform.platform, status: "error", error: error.message });
        }
    }

    return NextResponse.json({
        success: true,
        processed: results.length,
        totalAnalyzed,
        totalAlerts,
        results
    });
}
