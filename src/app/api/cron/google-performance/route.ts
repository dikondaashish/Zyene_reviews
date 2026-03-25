import { createAdminClient } from "@/lib/supabase/admin";
import { syncGooglePerformanceForPlatform } from "@/lib/google/performance-sync";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

/**
 * Daily job: sync Google Business Profile Performance API metrics + search keywords
 * for every active Google `review_platforms` row.
 *
 * Schedule in Vercel: e.g. `0 3 * * *` (03:00 UTC) with `Authorization: Bearer CRON_SECRET`.
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    if (
        process.env.NODE_ENV === "development" &&
        process.env.ALLOW_INSECURE_CRON === "true"
    ) {
        // dev only
    } else if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();

    const { data: platforms, error } = await admin
        .from("review_platforms")
        .select("id")
        .eq("platform", "google")
        .eq("sync_status", "active")
        .not("google_location_id", "is", null);

    if (error) {
        console.error("[Cron google-performance] fetch platforms:", error);
        Sentry.captureException(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    const results: Array<{ platformId: string; ok: boolean; error?: string; daily?: number; keywords?: number }> = [];

    for (const p of platforms || []) {
        try {
            const r = await syncGooglePerformanceForPlatform(p.id);
            results.push({
                platformId: p.id,
                ok: r.success,
                error: r.error,
                daily: r.dailyRowsUpserted,
                keywords: r.keywordRowsUpserted,
            });
            await new Promise((res) => setTimeout(res, 250));
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            results.push({ platformId: p.id, ok: false, error: msg });
            Sentry.captureException(e);
        }
    }

    const okCount = results.filter((r) => r.ok).length;

    return NextResponse.json({
        success: true,
        platforms: platforms?.length ?? 0,
        succeeded: okCount,
        results,
    });
}
