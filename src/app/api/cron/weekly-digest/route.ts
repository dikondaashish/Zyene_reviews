export const dynamic = "force-dynamic";

import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { inngest } from "@/services/inngest/client";
import { pingWeeklyDigestHeartbeat } from "@/lib/monitoring/weekly-digest-heartbeat";
import { runCronJob } from "@/lib/cron/run-cron-job";
import { listRecentReviewBusinessIds } from "@/lib/digest/recent-review-business-ids";

const DIGEST_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;
/** Keeps each Inngest send request well under its payload limit. */
const SEND_BATCH_SIZE = 500;
/**
 * Weekly digest fan-out. Schedule externally (e.g. cron-jobs.org): every Monday 09:00
 * in your chosen timezone, GET with Authorization: Bearer CRON_SECRET.
 *
 * Example cron-jobs.org: "0 9 * * MON" with timezone America/Chicago (adjust as needed).
 *
 * Better Stack: optional `BETTERSTACK_WEEKLY_DIGEST_HEARTBEAT_URL`; legacy monitor URL is built in if unset.
 * For a daily monitor: schedule GET /api/cron/daily-digest every day (heartbeat only).
 * For weekly emails: schedule this route weekly (e.g. Monday 09:00) and set monitor interval to 7-8 days,
 * or keep daily heartbeat via /api/cron/daily-digest.
 */
export async function GET(request: Request) {
    return runCronJob(request, { name: "weekly-digest", cadence: "weekly" }, async ({ occurrenceKey }) => {
        const admin = createAdminClient();
        const now = new Date();
        const weekAgo = new Date(now.getTime() - DIGEST_LOOKBACK_MS);

        try {
            // Paginated: a single query is capped at 1000 rows by PostgREST, which
            // silently dropped every business outside the newest 1000 reviews.
            const businessIds = await listRecentReviewBusinessIds(admin, weekAgo, now);

            if (businessIds.length === 0) {
                await pingWeeklyDigestHeartbeat(true);
                return NextResponse.json({
                    message: "No new reviews in the digest window",
                });
            }

            for (let i = 0; i < businessIds.length; i += SEND_BATCH_SIZE) {
                await inngest.send(
                    businessIds.slice(i, i + SEND_BATCH_SIZE).map((id) => ({
                        id: `cron:weekly-digest:${occurrenceKey}:${id}`,
                        name: "cron/weekly-digest.business",
                        data: { businessId: id },
                    })),
                );
            }

            await pingWeeklyDigestHeartbeat(true);

            return NextResponse.json({
                success: true,
                dispatched: businessIds.length,
                message: "Weekly digest background jobs fanned out",
            });
        } catch (error: unknown) {
            logger.error({ err: error }, "Weekly Digest CRON Error:");
            await pingWeeklyDigestHeartbeat(false);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    });
}
