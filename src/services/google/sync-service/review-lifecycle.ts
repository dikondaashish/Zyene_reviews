/** Google review sync — review-lifecycle */

import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import type { AdminClient } from "./helpers";

/**
 * After a full Google review list fetch, soft-hide rows that GBP no longer returns (e.g. customer deleted the review).
 * Skips if {@link reconciliationSafe} is false (sync hit MAX_REVIEW_PAGES with more pages left — list incomplete).
 */
export async function hideGoogleReviewsRemovedFromSource(
    admin: AdminClient,
    params: {
        businessId: string;
        platformId: string;
        googleExternalIdsSeen: ReadonlySet<string>;
        reconciliationSafe: boolean;
    }
): Promise<{ hidden: number }> {
    if (!params.reconciliationSafe) {
        return { hidden: 0 };
    }

    const { data: rows, error } = await admin
        .from("reviews")
        .select("id, external_id")
        .eq("business_id", params.businessId)
        .eq("platform", "google")
        .eq("platform_id", params.platformId)
        .eq("is_visible", true);

    if (error) {
        logger.error({ err: error }, "[Sync] Reconciliation select failed:");
        return { hidden: 0 };
    }

    const toHide = (rows || []).filter(
        (r: { id: string; external_id: string | null }) =>
            r.external_id && !params.googleExternalIdsSeen.has(r.external_id)
    );
    if (toHide.length === 0) {
        return { hidden: 0 };
    }

    const BATCH = 200;
    const batchOutcomes = await Promise.all(
        Array.from({ length: Math.ceil(toHide.length / BATCH) }, (_, index) => {
            const ids = toHide
                .slice(index * BATCH, index * BATCH + BATCH)
                .map((r: { id: string }) => r.id);
            return admin.from("reviews").update({ is_visible: false }).in("id", ids).then(({ error: upErr }) => ({
                ids,
                upErr,
            }));
        })
    );
    let hidden = 0;
    for (const { ids, upErr } of batchOutcomes) {
        if (upErr) {
            logger.error({ err: upErr }, "[Sync] Soft-hide batch failed:");
        } else {
            hidden += ids.length;
        }
    }
    return { hidden };
}

/**
 * After disconnect, `review_platforms` is deleted and reviews get `platform_id = NULL` (ON DELETE SET NULL).
 * When the user reconnects, point those rows at the new platform and show them again.
 */
export async function reattachOrphanedGoogleReviews(
    admin: AdminClient,
    businessId: string,
    platformId: string
): Promise<{ reattached: number }> {
    const { data: rows, error } = await admin
        .from("reviews")
        .update({ platform_id: platformId, is_visible: true })
        .eq("business_id", businessId)
        .eq("platform", "google")
        .is("platform_id", null)
        .select("id");

    if (error) {
        logger.error({ err: error }, "[Google] Reattach orphaned reviews failed:");
        return { reattached: 0 };
    }
    const n = rows?.length ?? 0;
    return { reattached: n };
}

/** Recompute `total_reviews` / `average_rating` for the Google platform row and business (matches finalize-style google-only rollups). */
export async function refreshGoogleReviewRollupsFromDb(
    admin: AdminClient,
    businessId: string,
    platformId: string
): Promise<void> {
    const { data: ratingRows, error } = await admin
        .from("reviews")
        .select("rating")
        .eq("business_id", businessId)
        .eq("platform", "google")
        .eq("is_visible", true);

    if (error) {
        logger.error({ err: error }, "[Google] Rollup select failed:");
        return;
    }

    const list = ratingRows || [];
    const total = list.length;
    const avg = total > 0 ? list.reduce((s, r) => s + Number(r.rating ?? 0), 0) / total : 0;
    const avgRounded = parseFloat(avg.toFixed(1));

    await admin
        .from("review_platforms")
        .update({
            total_reviews: total,
            average_rating: avgRounded,
            updated_at: new Date().toISOString(),
        })
        .eq("id", platformId);

    try {
        await admin
            .from("businesses")
            .update({
                total_reviews: total,
                average_rating: avgRounded,
                updated_at: new Date().toISOString(),
            })
            .eq("id", businessId);
    } catch (e) {
        logger.error({ err: e }, "[Google] Business rollup update failed:");
    }
}

/**
 * Publishes imported reviews to the dashboard while a multi-page sync is still running.
 * Updates rollups + `last_synced_at` without clearing `sync_status: running`.
 */
export async function publishGoogleReviewSyncProgress(
    admin: AdminClient,
    businessId: string,
    platformId: string
): Promise<void> {
    await refreshGoogleReviewRollupsFromDb(admin, businessId, platformId);
    await admin
        .from("review_platforms")
        .update({
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq("id", platformId)
        .eq("sync_status", "running");
}

