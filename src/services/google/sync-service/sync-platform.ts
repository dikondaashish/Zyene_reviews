/** Google review sync — sync-platform */

import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { inngest } from "@/services/inngest/client";
import type { AutoReplyBusinessSettings } from "@/services/reviews/auto-reply-eligibility";
import type { GooglePlatformWithTokens } from "@/types/google-sync";
import {
  clearGoogleSyncBootstrapHandoff,
  markGoogleSyncBootstrapHandoff,
} from "@/services/google/sync-run-state";
import {
  MAX_REVIEW_PAGES,
  PAGINATION_DELAY_MS,
} from "../constants";
import { clearForceFullSyncFlag, syncStateObject } from "./helpers";
import { hideGoogleReviewsRemovedFromSource } from "./review-lifecycle";
import { extendSyncLockTtl } from "./locks";
import { syncStateManagerFromContext } from "./list-reviews";
import { fetchGoogleReviewsPaginated } from "./pagination";
import { finalizeGoogleSync, enqueueMissingGoogleReviewAnalysis } from "./finalize";
import { prepareGoogleSync } from "./prepare-sync";
import { syncGoogleReviewsPage } from "./sync-page";
import { processGoogleReview } from "./process-review";
import type { SyncResult } from "./types";

/**
 * Compatibility wrapper for existing manual sync (Synchronous).
 * We keep this but internally it now uses the new decomposed steps.
 */
export async function syncGoogleReviewsForPlatform(platformId: string): Promise<SyncResult> {
    const context = await prepareGoogleSync(platformId);
    const admin = createAdminClient();
    const incrementalEnabled = process.env.ENABLE_INCREMENTAL_REVIEW_SYNC === "true";
    const stateObj = syncStateObject((context.platform as GooglePlatformWithTokens & { sync_state?: unknown })?.sync_state);
    const forceFullSync = stateObj.force_full_sync === true;
    const usingIncremental = incrementalEnabled && !forceFullSync;
    try {
        // Default to full-sync behavior unless explicitly enabled.
        if (!incrementalEnabled || forceFullSync) {
            const { googleReviews, apiTotalReviews, apiAverageRating, truncated } =
                await fetchGoogleReviewsPaginated(
                context.accessToken,
                context.googleAccountId,
                context.googleLocationId
            );

            const { data: autoReplyRow } = await admin
                .from("businesses")
                .select("auto_reply_enabled, auto_reply_enabled_at, auto_reply_min_rating, auto_reply_tone")
                .eq("id", context.platform.business_id)
                .single();
            const autoReplySettings = (autoReplyRow || null) as AutoReplyBusinessSettings | null;

            let totalSyncedFull = 0;
            const seenGoogleExternalIds = new Set<string>();

            for (const review of googleReviews) {
                const stats = await processGoogleReview(admin, context.platform, review, autoReplySettings);
                if (stats.upserted) totalSyncedFull++;
                if (review.reviewId) seenGoogleExternalIds.add(review.reviewId);
            }

            // Safe to reconcile only if we fetched every page Google had (not truncated) and counts match when API gives a total.
            const reconciliationSafe =
                !truncated &&
                (typeof apiTotalReviews === "number" && apiTotalReviews > 0
                    ? googleReviews.length >= apiTotalReviews
                    : true);
            await hideGoogleReviewsRemovedFromSource(admin, {
                businessId: context.platform.business_id,
                platformId: context.platform.id,
                googleExternalIdsSeen: seenGoogleExternalIds,
                reconciliationSafe,
            });

            await finalizeGoogleSync(
                platformId,
                context.platform.business_id,
                apiTotalReviews,
                apiAverageRating
            );
            await enqueueMissingGoogleReviewAnalysis(context.platform.business_id);

            if (forceFullSync) {
                await clearForceFullSyncFlag(platformId);
            }

            return {
                success: true,
                total: totalSyncedFull,
                fetched: totalSyncedFull,
                analyzed: 0,
                alerts: 0,
            };
        }

        let pageToken: string | undefined = undefined;
        let totalSynced = 0;
        let lastResp = null;
        let pageCount = 0;
        const seenGoogleExternalIds = new Set<string>();
        await syncStateManagerFromContext(context).beginSync(platformId);

        do {
            lastResp = await syncGoogleReviewsPage(context, pageToken);
            for (const id of lastResp.externalIdsOnPage) {
                seenGoogleExternalIds.add(id);
            }
            pageToken = lastResp.earlyExit ? undefined : lastResp.nextPageToken;
            totalSynced += lastResp.synced;
            pageCount++;

            if (pageCount % 5 === 0) {
                await extendSyncLockTtl(admin, platformId);
            }

            if (pageToken && pageCount < MAX_REVIEW_PAGES) {
                await new Promise((r) => setTimeout(r, PAGINATION_DELAY_MS));
            }
        } while (pageToken && pageCount < MAX_REVIEW_PAGES);

        const fullListFetched = !pageToken && !lastResp?.earlyExit;
        await hideGoogleReviewsRemovedFromSource(admin, {
            businessId: context.platform.business_id,
            platformId: context.platform.id,
            googleExternalIdsSeen: seenGoogleExternalIds,
            reconciliationSafe: fullListFetched,
        });

        const newHighWaterMark =
            context.highestReviewUpdateTime ??
            context.lastReviewUpdateTime ??
            new Date().toISOString();
        await syncStateManagerFromContext(context).completeSync(
            platformId,
            newHighWaterMark,
            context.reviewsProcessed
        );

        await finalizeGoogleSync(platformId, context.platform.business_id, lastResp?.total, lastResp?.avgRating);
        await enqueueMissingGoogleReviewAnalysis(context.platform.business_id);

        return {
            success: true,
            total: totalSynced,
            fetched: totalSynced, // For compatibility
            analyzed: 0,
            alerts: 0
        };
    } catch (error) {
        logger.error({ err: error }, "[Sync] Error in compatibility wrapper:");
        if (usingIncremental) {
            try {
                const message = error instanceof Error ? error.message : String(error);
                await syncStateManagerFromContext(context).failSync(platformId, message);
            } catch (stateErr) {
                logger.error({ err: stateErr }, "[Sync] Failed to mark sync_state failure:");
            }
        }
        // Release lock on error
        const admin = createAdminClient();
        await admin.from("review_platforms").update({ sync_status: 'idle', locked_until: null }).eq("id", platformId);
        throw error;
    }
}

