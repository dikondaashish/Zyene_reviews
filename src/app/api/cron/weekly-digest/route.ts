
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { inngest } from "@/services/inngest/client";

/** Rolling window of reviews to include in the weekly digest (matches email copy). */
const DIGEST_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;

function digestHeartbeatBaseUrl(): string | null {
    const raw =
        process.env.BETTERSTACK_WEEKLY_DIGEST_HEARTBEAT_URL ||
        process.env.BETTERSTACK_DAILY_DIGEST_HEARTBEAT_URL ||
        "";
    const base = raw.trim();
    return base ? base.replace(/\/+$/, "") : null;
}

async function pingDigestHeartbeat(ok: boolean): Promise<void> {
    const base = digestHeartbeatBaseUrl();
    if (!base) return;
    const url = ok ? base : `${base}/fail`;
    await fetch(url).catch(() => {});
}

/**
 * Weekly digest fan-out. Schedule externally (e.g. cron-jobs.org): every Monday 09:00
 * in your chosen timezone, GET with Authorization: Bearer CRON_SECRET.
 *
 * Example cron-jobs.org: "0 9 * * MON" with timezone America/Chicago (adjust as needed).
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
            await pingDigestHeartbeat(false);
            return NextResponse.json({ error: reviewError.message }, { status: 500 });
        }

        if (!recentReviews || recentReviews.length === 0) {
            await pingDigestHeartbeat(true);
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

        await pingDigestHeartbeat(true);

        return NextResponse.json({
            success: true,
            dispatched: businessIds.length,
            message: "Weekly digest background jobs fanned out",
        });
    } catch (error: unknown) {
        console.error("Weekly Digest CRON Error:", error);
        await pingDigestHeartbeat(false);
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
