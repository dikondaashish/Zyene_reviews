import { createAdminClient } from "@/lib/supabase/admin";
import { syncGooglePerformanceForPlatform } from "@/lib/google/performance-sync";
import { syncGooglePhase2ForPlatform } from "@/lib/google/phase2-sync";
import { syncGoogleListingProfileForPlatform } from "@/lib/google/phase3-sync";
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

    const results: Array<{
        platformId: string;
        ok: boolean;
        error?: string;
        daily?: number;
        keywords?: number;
        phase2?: { ok: boolean; error?: string; questions?: number; placeLinks?: number };
        phase3?: { ok: boolean; error?: string; profileHealthScore?: number };
    }> = [];

    for (const p of platforms || []) {
        try {
            const r = await syncGooglePerformanceForPlatform(p.id);
            let phase2: (typeof results)[0]["phase2"];
            try {
                const p2 = await syncGooglePhase2ForPlatform(p.id);
                phase2 = {
                    ok: p2.success,
                    error: p2.error,
                    questions: p2.questionsUpserted,
                    placeLinks: p2.placeLinksUpserted,
                };
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : String(e);
                phase2 = { ok: false, error: msg };
                Sentry.captureException(e);
            }

            let phase3: (typeof results)[0]["phase3"];
            try {
                const p3 = await syncGoogleListingProfileForPlatform(p.id);
                phase3 = {
                    ok: p3.success,
                    error: p3.error,
                    profileHealthScore: p3.profileHealthScore,
                };
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : String(e);
                phase3 = { ok: false, error: msg };
                Sentry.captureException(e);
            }

            results.push({
                platformId: p.id,
                ok: r.success && (phase2?.ok ?? false),
                error: [r.error, phase2?.error].filter(Boolean).join(" | ") || undefined,
                daily: r.dailyRowsUpserted,
                keywords: r.keywordRowsUpserted,
                phase2,
                phase3,
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
