/** Google review sync — bootstrap */

import { createAdminClient } from "@/lib/db/supabase/admin";
import {
  clearGoogleSyncBootstrapHandoff,
  markGoogleSyncBootstrapHandoff,
  reconcileStaleGoogleSyncRun,
} from "@/services/google/sync-run-state";
import { publishGoogleReviewSyncProgress } from "./review-lifecycle";
import { finalizeGoogleSync, enqueueMissingGoogleReviewAnalysis } from "./finalize";
import { prepareGoogleSync } from "./prepare-sync";
import { syncGoogleReviewsPage } from "./sync-page";
import type { GoogleSyncContext } from "./types";

/**
 * First-page import during onboarding / post-connect so reviews appear in seconds, not after
 * the full Inngest pagination + performance pipeline. Releases the lock for the background job.
 */
export async function bootstrapGoogleReviewsForPlatform(
    platformId: string
): Promise<{ synced: number; hasMore: boolean; completedInline: boolean }> {
    const admin = createAdminClient();
    let context: GoogleSyncContext | null = null;

    try {
        await reconcileStaleGoogleSyncRun(admin, platformId);

        context = await prepareGoogleSync(platformId);
        const result = await syncGoogleReviewsPage(context, undefined);
        await publishGoogleReviewSyncProgress(admin, context.platform.business_id, platformId);

        const hasMore = Boolean(result.nextPageToken && !result.earlyExit);

        if (!hasMore) {
            await finalizeGoogleSync(
                platformId,
                context.platform.business_id,
                result.total,
                result.avgRating
            );
            const highWater = context.highestReviewUpdateTime;
            if (typeof highWater === "string" && highWater.length > 0) {
                await admin
                    .from("review_platforms")
                    .update({ last_review_update_time: highWater })
                    .eq("id", platformId);
            }
            await clearGoogleSyncBootstrapHandoff(admin, platformId);
            void enqueueMissingGoogleReviewAnalysis(context.platform.business_id).catch((e) =>
                console.error("[Sync] Bootstrap inline analysis enqueue failed:", e)
            );
            return { synced: result.synced, hasMore: false, completedInline: true };
        }

        await markGoogleSyncBootstrapHandoff(admin, platformId);

        return { synced: result.synced, hasMore: true, completedInline: false };
    } catch (err) {
        if (context) {
            await admin
                .from("review_platforms")
                .update({ sync_status: "idle", locked_until: null })
                .eq("id", platformId);
        }
        throw err;
    }
}

