/** Google review sync — sync-page */

import { createAdminClient } from "@/lib/db/supabase/admin";
import { computeReviewHash } from "@/utils/review-hash";
import { inngest } from "@/services/inngest/client";
import { AI_ANALYSIS_BATCH_SIZE } from "../constants";
import type { AutoReplyBusinessSettings } from "@/services/reviews/auto-reply-eligibility";
import { publishGoogleReviewSyncProgress } from "./review-lifecycle";
import { listReviewsWithOrderByFallback, syncStateManagerFromContext } from "./list-reviews";
import { processGoogleReview } from "./process-review";
import type { GoogleSyncContext } from "./types";

/**
 * Step 2: Fetch and process a SINGLE page of reviews.
 */
export async function syncGoogleReviewsPage(
    context: GoogleSyncContext,
    pageToken?: string
): Promise<{
    nextPageToken?: string;
    synced: number;
    total: number;
    avgRating: number;
    /** Google `reviewId` values on this page — used to reconcile deletions after a full sync. */
    externalIdsOnPage: string[];
    earlyExit: boolean;
}> {
    const admin = createAdminClient();

    const apiResp = await listReviewsWithOrderByFallback(context, pageToken);

    /**
     * Incremental sync walks newest-first and stops when `updateTime <= last_review_update_time`.
     * If a past sync never imported the full history (e.g. job stopped early) but the watermark was
     * advanced to the listing's newest review, we would otherwise exit on the first row and never
     * paginate — leaving hundreds of older Google reviews missing from the DB.
     */
    if (!context.reviewGapCheckDone && !pageToken) {
        context.reviewGapCheckDone = true;
        const apiTotal =
            typeof apiResp.totalReviewCount === "number" && apiResp.totalReviewCount > 0
                ? apiResp.totalReviewCount
                : 0;
        if (apiTotal > 0 && context.lastReviewUpdateTime) {
            const { count: dbCount, error: countErr } = await admin
                .from("reviews")
                .select("id", { count: "exact", head: true })
                .eq("business_id", context.platform.business_id)
                .eq("platform", "google")
                .eq("is_visible", true);
            if (countErr) {
                console.error("[Sync] Review gap check (DB count) failed:", countErr);
            } else {
                const n = dbCount ?? 0;
                /** Small slack for removals / Maps vs API headline drift — large gaps still trigger backfill. */
                const slack = 25;
                if (n + slack < apiTotal) {
                    console.error(
                        `[Sync] Incomplete Google history: ${n} visible reviews in DB vs Google totalReviewCount=${apiTotal}. ` +
                            `Clearing incremental watermark for this run to backfill (platform ${context.platform.id}).`
                    );
                    context.lastReviewUpdateTime = null;
                    context.highestReviewUpdateTime = null;
                    const { error: clearHwErr } = await admin
                        .from("review_platforms")
                        .update({ last_review_update_time: null })
                        .eq("id", context.platform.id);
                    if (clearHwErr) {
                        console.error("[Sync] Failed to clear last_review_update_time for backfill:", clearHwErr);
                    }
                }
            }
        }
    }

    const { data: autoReplyRow } = await admin
        .from("businesses")
        .select("auto_reply_enabled, auto_reply_enabled_at, auto_reply_min_rating, auto_reply_tone")
        .eq("id", context.platform.business_id)
        .single();
    const autoReplySettings = (autoReplyRow || null) as AutoReplyBusinessSettings | null;

    let syncedCount = 0;
    const reviewIdsToAnalyze: string[] = [];
    /** Every ID Google returned on this page — needed for deletion reconciliation even when we hash-skip or early-exit mid-page. */
    const externalIdsOnPage: string[] = [];
    for (const review of apiResp.reviews) {
        if (review.reviewId) {
            externalIdsOnPage.push(review.reviewId);
        }
    }

    let earlyExit = false;

    let newReviewsCount = 0;
    for (const review of apiResp.reviews) {
        if (
            review.updateTime &&
            (!context.highestReviewUpdateTime ||
                new Date(review.updateTime).getTime() > new Date(context.highestReviewUpdateTime).getTime())
        ) {
            context.highestReviewUpdateTime = review.updateTime;
        }

        const contentHash = computeReviewHash(review);

        if (context.lastReviewUpdateTime && new Date(review.updateTime).getTime() <= new Date(context.lastReviewUpdateTime).getTime()) {
            earlyExit = true;
            break;
        }

        const { data: existing } = await admin
            .from("reviews")
            .select("content_hash, response_source, response_text")
            .eq("business_id", context.platform.business_id)
            .eq("platform", "google")
            .eq("external_id", review.reviewId)
            .maybeSingle();

        if (existing?.content_hash && existing.content_hash === contentHash) {
            continue;
        }

        const stats = await processGoogleReview(admin, context.platform, review, autoReplySettings, {
            existing,
            contentHash,
            googleUpdateTime: review.updateTime,
        });
        if (stats.upserted) {
            syncedCount++;
            if (stats.id && stats.needsAnalysis) {
                reviewIdsToAnalyze.push(stats.id);
            }
            if (stats.isNew) {
                newReviewsCount++;
            }
        }
    }

    // Trigger AI Analysis for this page's chunk
    if (reviewIdsToAnalyze.length > 0) {
        for (let i = 0; i < reviewIdsToAnalyze.length; i += AI_ANALYSIS_BATCH_SIZE) {
            const chunk = reviewIdsToAnalyze.slice(i, i + AI_ANALYSIS_BATCH_SIZE);
            await inngest.send({
                name: "review/analyze.batch",
                data: { reviewIds: chunk }
            });
        }
    }

    context.reviewsProcessed += syncedCount;
    await syncStateManagerFromContext(context).checkpointSync(
        context.platform.id,
        earlyExit ? "__EARLY_EXIT__" : apiResp.nextPageToken ?? "",
        context.reviewsProcessed
    );

    await publishGoogleReviewSyncProgress(admin, context.platform.business_id, context.platform.id);

    return {
        nextPageToken: earlyExit ? undefined : apiResp.nextPageToken,
        synced: syncedCount,
        total: apiResp.totalReviewCount || 0,
        avgRating: apiResp.averageRating || 0,
        externalIdsOnPage,
        earlyExit,
    };
}

