import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
export const dynamic = "force-dynamic";

import { inngest } from "@/services/inngest/client";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { pingReviewSyncHeartbeat } from "@/lib/monitoring/review-sync-heartbeat";
import { isAuthorizedCronRequest } from "@/lib/cron/authorize-cron-request";
import { RECURRING_SYNC_ELIGIBLE_STATUSES } from "@/services/google/recurring-sync-eligibility";

export async function GET(request: Request) {
    try {
        if (!isAuthorizedCronRequest(request)) {
            logger.error("[Cron] Unauthorized access attempt");
            // Ping fail so we know the cron tried to run but was blocked
            await pingReviewSyncHeartbeat(false);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admin = createAdminClient();

        // 2. Fetch every connected review platform.
        // `idle` is the state finalizeGoogleSync leaves behind after a SUCCESSFUL sync, so
        // filtering on `active` alone silently evicted each platform the moment it worked.
        // See RECURRING_SYNC_ELIGIBLE_STATUSES. Overlap is prevented downstream by
        // acquire_platform_lock + enforceSyncCooldown, not by this filter.
        const { data: platforms, error } = await admin
            .from("review_platforms")
            .select("id, platform")
            .in("sync_status", [...RECURRING_SYNC_ELIGIBLE_STATUSES])
            .in("platform", ["google", "yelp", "facebook"]);

        if (error) {
            logger.error({ err: error }, "[Cron] Failed to fetch platforms:");
            Sentry.captureException(error, { tags: { route: "cron-sync-reviews", step: "fetch_platforms" } });
            await pingReviewSyncHeartbeat(false);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }

        // 3. Dispatch background jobs via Inngest
        if (platforms && platforms.length > 0) {
            try {
                await inngest.send(
                    platforms.map((p) => ({
                        name: "review/sync.platform",
                        data: {
                            platformId: p.id,
                            platformType: p.platform as "google" | "yelp" | "facebook",
                        },
                    }))
                );
            } catch (inngestError) {
                logger.error({ err: inngestError }, "[Cron] Inngest dispatch failed:");
                Sentry.captureException(inngestError, { tags: { route: "cron-sync-reviews", step: "inngest_dispatch" } });
                await pingReviewSyncHeartbeat(false);
                throw inngestError;
            }
        }

        // 4. Heartbeat success ping!
        await pingReviewSyncHeartbeat(true);

        return NextResponse.json({
            success: true,
            dispatched: platforms?.length || 0,
            message: "Background synchronization fanned out"
        });
    } catch (error: unknown) {
        logger.error({ err: error }, "[Cron] Unexpected error in sync-reviews:");
        Sentry.captureException(error, { tags: { route: "cron-sync-reviews", step: "unexpected" } });
        
        // Final attempt to notify monitoring of failure
        await pingReviewSyncHeartbeat(false);
        
        return NextResponse.json({ 
            error: "Internal Server Error",
            message: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
