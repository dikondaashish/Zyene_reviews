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

export const processReviewAnalysisBatch = inngest.createFunction(
    {
        id: "process-review-analysis-batch",
        name: "Process Review Analysis Batch",
        concurrency: {
            limit: 5, // Process 5 batches at once max to stay within Gemini rate limits
        }
    },
    { event: "review/analyze.batch" },
    async ({ event, step }: { event: { data: { reviewIds: string[] } }, step: any }) => {
        const { reviewIds } = event.data;
        const supabase = createAdminClient();

        // 1. Fetch the reviews from Supabase
        const reviews = await step.run("fetch-reviews", async () => {
            const { data, error } = await supabase
                .from("reviews")
                .select("id, rating, text")
                .in("id", reviewIds);
            if (error) throw new Error(`Failed to fetch reviews: ${error.message}`);
            return data;
        });

        if (!reviews || reviews.length === 0) return { status: "no_reviews_found" };

        // 2. Format for AI
        // Must use `reviewId` in the payload — the model output schema uses reviewId; using `id` often causes
        // the model to return `id` instead, so .eq("id", result.reviewId) updates zero rows.
        const reviewsForAi = reviews.map((r: { id: string, rating: number, text: string | null }) => ({
            reviewId: r.id,
            rating: r.rating,
            text: r.text || ""
        }));

        const prompt = BATCH_REVIEWS_PROMPT
            .replace(/\{count\}/g, reviewsForAi.length.toString())
            .replace("{reviews_json}", JSON.stringify(reviewsForAi, null, 2));

        // 3. Call Gemini with Fallback
        const aiResults = await step.run("call-gemini-batch", async () => {
            const content = await generateContentWithFallback(prompt, {
                requireJson: true,
                schema: batchAnalysisSchema,
            });
            
            try {
                return JSON.parse(content);
            } catch (err) {
                logger.error({ err: content }, "[Batch Analysis] Failed to parse AI JSON inside schema step:");
                throw new Error("AI returned invalid JSON array despite schema enforcement");
            }
        });

        // 4. Update reviews in Supabase
        await step.run("update-reviews-batch", async () => {
            if (!Array.isArray(aiResults)) {
                logger.error({ err: typeof aiResults }, "[Batch Analysis] AI result is not an array:");
                throw new Error("AI returned non-array batch result");
            }
            for (const result of aiResults as Array<{
                reviewId?: string;
                id?: string;
                sentiment?: string;
                urgency?: number;
                themes?: string[];
                summary?: string;
            }>) {
                const reviewRowId = result.reviewId ?? result.id;
                if (!reviewRowId) {
                    continue;
                }

                const { error: updateError } = await supabase
                    .from("reviews")
                    .update({
                        sentiment: normalizeSentimentForDb(result.sentiment),
                        urgency_score: normalizeUrgencyForDb(result.urgency),
                        themes: normalizeThemesForDb(result.themes),
                        ai_summary: result.summary ?? "",
                    })
                    .eq("id", reviewRowId);

                if (updateError) {
                    logger.error({ err: updateError }, `[Batch Analysis] Update failed for ${reviewRowId}:`);
                }

                if (result.urgency !== undefined && result.urgency >= 7) {
                    const reviewObj = reviews.find((r: { id: string }) => r.id === reviewRowId);
                    if (reviewObj) {
                        await sendReviewAlert({ ...reviewObj, ...result });
                    }
                }
            }
        });

        return { status: "completed", processed: aiResults.length };
    }
);
