import { logger } from "@/lib/logger";
import { inngest } from "../client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { sendReviewRequest } from "@/lib/notifications/review-request";
import { generateContentWithFallback } from "@/domains/ai/adapters/vertex-adapter";
import { BATCH_REVIEWS_PROMPT } from "@/domains/ai/prompts";
import { sendReviewAlert } from "@/lib/notifications/review-alert";
import { batchAnalysisSchema } from "@/domains/ai/schemas/response-schemas";
import {
    syncGoogleReviewsForPlatform,
    prepareGoogleSync,
    syncGoogleReviewsPage,
    finalizeGoogleSync,
    enqueueMissingGoogleReviewAnalysis,
    hideGoogleReviewsRemovedFromSource,
    readGoogleReviewSyncResumeCursor,
} from "@/services/google/sync-service";
import { AI_ANALYSIS_BATCH_SIZE, MAX_REVIEW_PAGES } from "@/services/google/constants";
import { syncGooglePerformanceForPlatform } from "@/services/google/performance-sync";
import {
    normalizeSentimentForDb,
    normalizeThemesForDb,
    normalizeUrgencyForDb,
} from "@/domains/ai/normalize-analysis-for-db";
import { pingReviewSyncHeartbeat } from "@/lib/monitoring/review-sync-heartbeat";
import { checkLimit } from "@/lib/stripe/check-limits";
import { planAllowsAutoCommenter } from "@/services/stripe/plans";
import { generateReplyDraftText, type ReplyTone } from "@/domains/ai/services/generate-reply-draft";
import { postGoogleReplySystem } from "@/services/reviews/post-google-reply-system";
import {
    AUTO_REPLY_ENABLED_AT_SKEW_MS,
    AUTO_REPLY_MAX_REVIEW_AGE_MS,
} from "@/services/reviews/auto-reply-eligibility";
import { acquireLock, releaseLock } from "@/lib/db/redis-lock";
import { processOneScheduled } from "@/lib/review-requests/process-scheduled-queue";
import { aiAnalysisBusinessRateLimit } from "@/lib/auth/rate-limit";
import { planAllowsAiReviewFeatures } from "@/services/stripe/plans";
import { z } from "zod";
import { assertSingleBusinessBatch, isAllowedAnalysisResult } from "@/services/ai/analysis-batch-boundary";

const analysisIdsSchema = z.array(z.string().uuid()).min(1).max(AI_ANALYSIS_BATCH_SIZE);

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
        const reviewIds = analysisIdsSchema.parse(event.data.reviewIds);
        const supabase = createAdminClient();

        // 1. Fetch the reviews from Supabase
        const reviews = await step.run("fetch-reviews", async () => {
            const { data, error } = await supabase
                .from("reviews")
                .select("id, business_id, rating, text, sentiment")
                .in("id", reviewIds);
            if (error) throw new Error(`Failed to fetch reviews: ${error.message}`);
            return data;
        });

        const { businessId, allowedIds } = assertSingleBusinessBatch(reviewIds, reviews ?? []);
        const pendingReviews = reviews.filter((review: { sentiment: string | null }) => review.sentiment === null);
        if (pendingReviews.length === 0) return { status: "already_analyzed" };
        const pendingIds = new Set(pendingReviews.map((review: { id: string }) => review.id));
        const { data: business, error: businessError } = await supabase.from("businesses")
            .select("organizations!inner(plan,plan_status)")
            .eq("id", businessId).maybeSingle();
        if (businessError || !business ||
            !planAllowsAiReviewFeatures(business.organizations?.plan ?? null,
                business.organizations?.plan_status ?? null)) {
            return { status: "plan_unavailable" };
        }

        // 2. Format for AI
        // Must use `reviewId` in the payload - the model output schema uses reviewId; using `id` often causes
        // the model to return `id` instead, so .eq("id", result.reviewId) updates zero rows.
        const reviewsForAi = pendingReviews.map((r: { id: string, rating: number, text: string | null }) => ({
            reviewId: r.id,
            rating: r.rating,
            text: r.text || ""
        }));

        const prompt = BATCH_REVIEWS_PROMPT
            .replace(/\{count\}/g, reviewsForAi.length.toString())
            .replace("{reviews_json}", JSON.stringify(reviewsForAi, null, 2));

        // 3. Call Gemini with Fallback
        const aiResults = await step.run("call-gemini-batch", async () => {
            const { success } = await aiAnalysisBusinessRateLimit.limit(businessId);
            if (!success) throw new Error("Daily analysis budget exhausted");
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
            await Promise.all(
                (aiResults as Array<{
                    reviewId?: string;
                    id?: string;
                    sentiment?: string;
                    urgency?: number;
                    themes?: string[];
                    summary?: string;
                }>).map(async (result) => {
                    const reviewRowId = result.reviewId ?? result.id;
                    if (!isAllowedAnalysisResult(reviewRowId, allowedIds) || !pendingIds.has(reviewRowId)) {
                        return;
                    }

                    const { error: updateError } = await supabase
                        .from("reviews")
                        .update({
                            sentiment: normalizeSentimentForDb(result.sentiment),
                            urgency_score: normalizeUrgencyForDb(result.urgency),
                            themes: normalizeThemesForDb(result.themes),
                            ai_summary: result.summary ?? "",
                        })
                        .eq("id", reviewRowId)
                        .eq("business_id", businessId)
                        .is("sentiment", null);

                    if (updateError) {
                        logger.error({ err: updateError }, `[Batch Analysis] Update failed for ${reviewRowId}:`);
                    }

                    if (result.urgency !== undefined && result.urgency >= 7) {
                        const reviewObj = reviews.find((r: { id: string }) => r.id === reviewRowId);
                        if (reviewObj) {
                            await sendReviewAlert({ ...reviewObj, ...result });
                        }
                    }
                })
            );
        });

        return { status: "completed", processed: aiResults.length };
    }
);
