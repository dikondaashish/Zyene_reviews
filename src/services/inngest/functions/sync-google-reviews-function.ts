import { logger } from "@/lib/logger";
import { inngest } from "../client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { sendReviewRequest } from "@/lib/notifications/review-request";
import { generateContentWithFallback } from "@/domains/ai/adapters/VertexAdapter";
import { BATCH_REVIEWS_PROMPT } from "@/domains/ai/prompts";
import { sendReviewAlert } from "@/lib/notifications/review-alert";
import { batchAnalysisSchema } from "@/domains/ai/schemas/ResponseSchemas";
import {
    syncGoogleReviewsForPlatform,
    prepareGoogleSync,
    syncGoogleReviewsPage,
    finalizeGoogleSync,
    enqueueMissingGoogleReviewAnalysis,
    hideGoogleReviewsRemovedFromSource,
    readGoogleReviewSyncResumeCursor,
} from "@/services/google/sync-service";
import { MAX_REVIEW_PAGES } from "@/services/google/constants";
import { syncGooglePerformanceForPlatform } from "@/services/google/performance-sync";
import {
    normalizeSentimentForDb,
    normalizeThemesForDb,
    normalizeUrgencyForDb,
} from "@/domains/ai/normalizeAnalysisForDb";
import { pingReviewSyncHeartbeat } from "@/lib/monitoring/review-sync-heartbeat";
import { checkLimit } from "@/lib/stripe/check-limits";
import { planAllowsAutoCommenter } from "@/services/stripe/plans";
import { generateReplyDraftText, type ReplyTone } from "@/domains/ai/services/generateReplyDraft";
import { postGoogleReplySystem } from "@/services/reviews/post-google-reply-system";
import {
    AUTO_REPLY_ENABLED_AT_SKEW_MS,
    AUTO_REPLY_MAX_REVIEW_AGE_MS,
} from "@/services/reviews/auto-reply-eligibility";
import { acquireLock, releaseLock } from "@/lib/db/redis-lock";
import { processOneScheduled } from "@/lib/review-requests/process-scheduled-queue";

export const syncGoogleReviews = inngest.createFunction(
    {
        id: "sync-google-reviews",
        name: "Sync Google Reviews",
        concurrency: {
            limit: 5,
        },
    },
    { event: "google/sync.reviews" },
    async ({ event, step }: { event: { data: { platformId: string } }, step: any }) => {
        const { platformId } = event.data;
        const supabase = createAdminClient();

        try {
            // 1. Setup Context (Lock, IDs, Token)
            const context = await step.run("setup-context", async () => {
                return await prepareGoogleSync(platformId);
            });

            const resumePageToken = await step.run("read-resume-cursor", async () => {
                return readGoogleReviewSyncResumeCursor(platformId);
            });

            let pageToken: string | undefined = resumePageToken ?? undefined;
            let totalSynced = 0;
            let lastResp: { total: number; avgRating: number } | null = null;
            let pageCount = resumePageToken ? 1 : 0;
            const seenGoogleExternalIds: string[] = [];

            // 2. Paginated Sync (Each page is a Step)
            do {
                const result = await step.run(`sync-page-${pageCount + 1}`, async () => {
                    return await syncGoogleReviewsPage(context, pageToken);
                });

                pageToken = result.nextPageToken;
                totalSynced += result.synced;
                lastResp = { total: result.total, avgRating: result.avgRating };
                seenGoogleExternalIds.push(...result.externalIdsOnPage);
                pageCount++;
            } while (pageToken && pageCount < MAX_REVIEW_PAGES);

            const fullListFetched = !pageToken;

            await step.run("reconcile-removed-google-reviews", async () => {
                const admin = createAdminClient();
                return hideGoogleReviewsRemovedFromSource(admin, {
                    businessId: context.platform.business_id,
                    platformId: context.platform.id,
                    googleExternalIdsSeen: new Set(seenGoogleExternalIds),
                    reconciliationSafe: fullListFetched,
                });
            });

            // 3. Finalize
            await step.run("finalize-sync", async () => {
                await finalizeGoogleSync(
                    platformId,
                    context.platform.business_id,
                    lastResp?.total,
                    lastResp?.avgRating
                );
                const admin = createAdminClient();
                const highWater = context.highestReviewUpdateTime;
                if (typeof highWater === "string" && highWater.length > 0) {
                    await admin
                        .from("review_platforms")
                        .update({ last_review_update_time: highWater })
                        .eq("id", platformId);
                }
            });

            await step.run("enqueue-missing-analysis", async () => {
                return enqueueMissingGoogleReviewAnalysis(context.platform.business_id);
            });

            // Listing performance + search keywords — after reviews are visible and analysis is queued
            await step.run("sync-google-performance", async () => {
                const r = await syncGooglePerformanceForPlatform(platformId);
                if (!r.success) {
                    logger.error({ err: r.error
                     }, `[Inngest] Google Business Profile performance sync failed for ${platformId}:`);
                }
                return r;
            });

            await pingReviewSyncHeartbeat(true);

            return { status: "completed", pages: pageCount, synced: totalSynced };
        } catch (error: any) {
            logger.error({ err: error }, `[Inngest] Sync failed for platform ${platformId}:`);

            // Update status to error in DB so it's not stuck as "running"
            await step.run("mark-as-error", async () => {
                const { clearGoogleSyncBootstrapHandoff } = await import(
                    "@/services/google/sync-run-state"
                );
                await supabase
                    .from("review_platforms")
                    .update({
                        sync_status: "error",
                        locked_until: null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", platformId);
                await clearGoogleSyncBootstrapHandoff(supabase, platformId);
            });

            throw error; // Rethrow for Inngest retries if needed
        }
    }
);
