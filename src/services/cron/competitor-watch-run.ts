import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { fetchAllReviewRowsPaginated } from "@/lib/reviews/fetch-reviews-paginated";
import { pingCompetitorWatchHeartbeat } from "@/lib/monitoring/competitor-watch-heartbeat";
import { inngest } from "@/services/inngest/client";
import { COMPETITOR_WATCH_BUSINESS_EVENT } from "./competitor-watch-business";

/** Inngest accepts batches, but keep each send request well under its payload limit. */
const SEND_CHUNK = 500;

/**
 * Daily Competitor Watch fan-out. Scanning every competitor of every tenant in this
 * one request used to time out once there were a few hundred competitors, losing the
 * whole day for everyone. Now each business is its own Inngest run that writes its
 * results as soon as it finishes; this request only lists businesses and dispatches.
 *
 * Event ids are `cron:competitor-watch:<day>:<businessId>`, so a rerun of the same
 * day (cron retry, manual trigger) is deduplicated by Inngest and never scans or
 * emails a business twice.
 *
 * Success heartbeats come from the per-business worker once a scan really finishes;
 * accepting events proves nothing, so this request only pings failure (or success when
 * there is nothing to scan).
 */
export async function executeCompetitorWatchCron(occurrenceKey: string): Promise<Response> {
    const admin = createAdminClient();
    try {
        const { data: rows, error } = await fetchAllReviewRowsPaginated<{ business_id: string }>(1000, (from, to) =>
            admin
                .from("competitors")
                .select("business_id")
                .order("id", { ascending: true })
                .range(from, to),
        );
        if (error) {
            logger.error({ err: error }, "[cron/competitor-watch] competitors fetch failed:");
            await pingCompetitorWatchHeartbeat(false);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }

        const businessIds = Array.from(new Set(rows.map((r) => r.business_id).filter(Boolean)));
        if (businessIds.length === 0) {
            await pingCompetitorWatchHeartbeat(true);
            return NextResponse.json({ success: true, dispatched: 0, message: "No competitors to process" });
        }

        for (let i = 0; i < businessIds.length; i += SEND_CHUNK) {
            await inngest.send(
                businessIds.slice(i, i + SEND_CHUNK).map((businessId) => ({
                    id: `cron:competitor-watch:${occurrenceKey}:${businessId}`,
                    name: COMPETITOR_WATCH_BUSINESS_EVENT,
                    data: { businessId, occurrenceKey },
                })),
            );
        }

        return NextResponse.json({ success: true, dispatched: businessIds.length });
    } catch (error: unknown) {
        logger.error({ err: error }, "[cron/competitor-watch] fan-out failed:");
        await pingCompetitorWatchHeartbeat(false);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
