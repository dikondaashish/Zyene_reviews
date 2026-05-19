export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { inngest } from "@/services/inngest/client";
import { isAuthorizedCronRequest } from "@/lib/cron/authorize-cron-request";
import { pingWeeklyDigestHeartbeat } from "@/lib/monitoring/weekly-digest-heartbeat";

/** Rolling window of reviews to include in the weekly digest (matches email copy). */
const DIGEST_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Weekly digest fan-out. Schedule externally (e.g. cron-jobs.org): every Monday 09:00
 * in your chosen timezone, GET with Authorization: Bearer CRON_SECRET.
 *
 * Example cron-jobs.org: "0 9 * * MON" with timezone America/Chicago (adjust as needed).
 *
 * Better Stack: optional `BETTERSTACK_WEEKLY_DIGEST_HEARTBEAT_URL`; legacy monitor URL is built in if unset.
 * For a daily monitor: schedule GET /api/cron/daily-digest every day (heartbeat only).
 * For weekly emails: schedule this route weekly (e.g. Monday 09:00) and set monitor interval to 7–8 days,
 * or keep daily heartbeat via /api/cron/daily-digest.
 */
export async function GET(request: Request) {
    if (!isAuthorizedCronRequest(request)) {
        await pingWeeklyDigestHeartbeat(false);
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const admin = createAdminClient();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - DIGEST_LOOKBACK_MS);

    try {
        const { data: recentReviews, error: reviewError } = await admin
            .from("reviews")
            .select(`
                id,
                rating,
                text,
                author_name,
                sentiment,
                created_at,
                business_id,
                businesses (
                    id,
                    name,
                    organization_id,
                    slug
                )
            `)
            .gte("created_at", weekAgo.toISOString())
            .order("created_at", { ascending: false });

        if (reviewError) {
            await pingWeeklyDigestHeartbeat(false);
            return NextResponse.json({ error: reviewError.message }, { status: 500 });
        }

        if (!recentReviews || recentReviews.length === 0) {
            await pingWeeklyDigestHeartbeat(true);
            return NextResponse.json({ message: "No new reviews in the digest window" });
        }

        const businessIds = Array.from(new Set(recentReviews.map(r => r.business_id)));

        console.log(`[Cron] Dispatching weekly digest for ${businessIds.length} businesses`);

        if (businessIds.length > 0) {
            await inngest.send(
                businessIds.map((id) => ({
                    name: "cron/weekly-digest.business",
                    data: { businessId: id },
                }))
            );
        }

        await pingWeeklyDigestHeartbeat(true);

        return NextResponse.json({
            success: true,
            dispatched: businessIds.length,
            message: "Weekly digest background jobs fanned out",
        });
    } catch (error: unknown) {
        console.error("Weekly Digest CRON Error:", error);
        await pingWeeklyDigestHeartbeat(false);
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
