import { createAdminClient } from "@/lib/db/supabase/admin";
export const dynamic = "force-dynamic";

import { syncGooglePerformanceForPlatform } from "@/services/google/performance-sync";
import { syncGooglePhase2ForPlatform } from "@/services/google/phase2-sync";
import { syncGoogleListingProfileForPlatform } from "@/services/google/phase3-sync";
import { syncGoogleLodgingForPlatform } from "@/services/google/phase4-sync";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

/**
 * Daily job: sync Google Business Profile Performance API metrics + search keywords
 * for every active Google `review_platforms` row.
 *
 * Schedule in Vercel: e.g. `0 3 * * *` (03:00 UTC) with `Authorization: Bearer CRON_SECRET`.
 */
export async function GET(request: Request) {
    // Verify Cron Secret — always required
    const authHeader = request.headers.get("authorization");
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();

    // Include healthy-ish rows: `idle` after review sync, `active` after token refresh / location save,
    // `pending` from older rows. Skip `running` and anything `error*`.
    const { data: platforms, error } = await admin
        .from("review_platforms")
        .select("id, sync_status")
        .eq("platform", "google")
        .neq("sync_status", "running")
        .not("sync_status", "like", "error%")
        .not("google_location_id", "is", null);

    if (error) {
        console.error("[Cron google-performance] fetch platforms:", error);
        Sentry.captureException(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    const results: Array<{
        platformId: string;
        syncStatus?: string | null;
        /** GBP Performance API + DB upsert (listing metrics / keywords) */
        performanceOk: boolean;
        performanceError?: string;
        dailyRowsUpserted?: number;
        keywordRowsUpserted?: number;
        /** Legacy: true only if performance + phase2 Q&A both succeeded (for dashboards that assumed one flag) */
        ok: boolean;
        error?: string;
        daily?: number;
        keywords?: number;
        phase2?: { ok: boolean; error?: string; questions?: number; placeLinks?: number };
        phase3?: { ok: boolean; error?: string; profileHealthScore?: number };
        phase4?: {
            ok: boolean;
            error?: string;
            lodgingAvailable?: boolean;
            lodgingHealthScore?: number;
        };
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

            let phase4: (typeof results)[0]["phase4"];
            try {
                const p4 = await syncGoogleLodgingForPlatform(p.id);
                phase4 = {
                    ok: p4.success,
                    error: p4.error,
                    lodgingAvailable: p4.lodgingAvailable,
                    lodgingHealthScore: p4.healthScore,
                };
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : String(e);
                phase4 = { ok: false, error: msg };
                Sentry.captureException(e);
            }

            const performanceOk = r.success;
            const combinedOk = r.success && (phase2?.ok ?? false);
            results.push({
                platformId: p.id,
                syncStatus: (p as { sync_status?: string | null }).sync_status ?? null,
                performanceOk,
                performanceError: r.error,
                dailyRowsUpserted: r.dailyRowsUpserted,
                keywordRowsUpserted: r.keywordRowsUpserted,
                ok: combinedOk,
                error: [r.error, phase2?.error].filter(Boolean).join(" | ") || undefined,
                daily: r.dailyRowsUpserted,
                keywords: r.keywordRowsUpserted,
                phase2,
                phase3,
                phase4,
            });
            await new Promise((res) => setTimeout(res, 250));
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            results.push({
                platformId: p.id,
                performanceOk: false,
                ok: false,
                error: msg,
            });
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
