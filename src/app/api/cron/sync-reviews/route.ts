import { createAdminClient } from "@/lib/supabase/admin";
import { syncGoogleReviewsForPlatform } from "@/lib/google/sync-service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    // Verify Cron Secret
    const authHeader = request.headers.get("authorization");
    const isLocal = request.headers.get("host")?.includes("localhost");

    if (!isLocal && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const admin = createAdminClient();

    // Fetch all active platforms
    const { data: platforms, error } = await admin
        .from("review_platforms")
        .select("id")
        .eq("sync_status", "active");

    if (error) {
        console.error("Cron: Failed to fetch platforms", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`[Cron] Starting sync for ${platforms?.length || 0} platforms`);

    const results = [];
    let totalAnalyzed = 0;
    let totalAlerts = 0;

    // Process sequentially to limit concurrency/rate-limits
    for (const platform of platforms || []) {
        try {
            const stats = await syncGoogleReviewsForPlatform(platform.id);
            // @ts-ignore
            totalAnalyzed += stats.analyzed || 0;
            // @ts-ignore
            totalAlerts += stats.alerts || 0;
            results.push({ id: platform.id, status: "success", ...stats });
        } catch (error: any) {
            console.error(`[Cron] Sync Failed for platform ${platform.id}:`, error);
            results.push({ id: platform.id, status: "error", error: error.message });
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
