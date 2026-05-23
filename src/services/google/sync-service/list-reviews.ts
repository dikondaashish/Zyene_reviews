/** Google review sync — list-reviews */

import { listReviews } from "../business-profile";
import { SyncStateManager } from "@/services/google/sync-state-manager";
import type { GoogleSyncContext } from "./types";
import { isOrderByUnsupportedError } from "./helpers";

/**
 * Inngest persists step output as JSON; `syncStateManager` becomes a plain object and
 * `instanceof SyncStateManager` is unreliable across bundles. Use duck typing and fall back.
 */
export function syncStateManagerFromContext(context: GoogleSyncContext): SyncStateManager {
    const m = context.syncStateManager as unknown;
    if (
        m != null &&
        typeof m === "object" &&
        typeof (m as { checkpointSync?: unknown }).checkpointSync === "function" &&
        typeof (m as { beginSync?: unknown }).beginSync === "function" &&
        typeof (m as { completeSync?: unknown }).completeSync === "function" &&
        typeof (m as { failSync?: unknown }).failSync === "function"
    ) {
        return m as SyncStateManager;
    }
    return new SyncStateManager();
}

export async function listReviewsWithOrderByFallback(
    context: GoogleSyncContext,
    pageToken?: string
) {
    if (!context.orderByUpdateTimeEnabled) {
        return listReviews(
            context.accessToken,
            context.googleAccountId,
            context.googleLocationId,
            pageToken,
            false
        );
    }

    try {
        let resp = await listReviews(
            context.accessToken,
            context.googleAccountId,
            context.googleLocationId,
            pageToken,
            true
        );

        // Some locations return 200 + empty `reviews` with orderBy even when Google reports reviews
        // (Maps/GBP show N reviews). We only catch thrown errors below; handle this silent mismatch too.
        const noPageToken = !pageToken;
        const emptyList = !resp.reviews || resp.reviews.length === 0;
        const googleSaysHasReviews =
            (typeof resp.totalReviewCount === "number" && resp.totalReviewCount > 0) ||
            (typeof resp.averageRating === "number" && resp.averageRating > 0);
        if (noPageToken && emptyList && googleSaysHasReviews) {
            console.error(
                `[Sync] First page: 0 reviews but totalReviewCount=${String(resp.totalReviewCount)} avg=${String(resp.averageRating)} with orderBy; retrying without orderBy (platform ${context.platform.id}).`
            );
            context.orderByUpdateTimeEnabled = false;
            context.lastReviewUpdateTime = null;
            resp = await listReviews(
                context.accessToken,
                context.googleAccountId,
                context.googleLocationId,
                pageToken,
                false
            );
        }

        return resp;
    } catch (error) {
        if (!isOrderByUnsupportedError(error)) {
            throw error;
        }
        console.error(
            `[Sync] orderBy=updateTime desc unsupported for platform ${context.platform.id}. Falling back to unsorted review fetch.`
        );
        context.orderByUpdateTimeEnabled = false;
        // Disable early-stop optimization if source isn't sorted.
        context.lastReviewUpdateTime = null;
        return listReviews(
            context.accessToken,
            context.googleAccountId,
            context.googleLocationId,
            pageToken,
            false
        );
    }
}

