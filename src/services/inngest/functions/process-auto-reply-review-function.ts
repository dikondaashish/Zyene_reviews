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
import { MAX_REVIEW_PAGES } from "@/services/google/constants";
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
const AUTO_REPLY_TONES: ReplyTone[] = ["professional", "friendly", "concise"];


export const processAutoReplyReview = inngest.createFunction(
    {
        id: "process-auto-reply-review",
        name: "Auto-reply to Google review (AI)",
        concurrency: { limit: 1, key: "event.data.reviewId" },
        retries: 2,
    },
    { event: "review/auto-reply" },
    async ({ event, step }: { event: { data: { reviewId: string } }; step: any }) => {
        const { reviewId } = event.data;

        const gate = await step.run("gate-check", async () => {
            const admin = createAdminClient();
            const { data: row, error } = await admin
                .from("reviews")
                .select(`
                    id,
                    rating,
                    text,
                    response_status,
                    platform,
                    review_date,
                    selected_staff,
                    businesses!inner (
                        id,
                        name,
                        category,
                        organization_id,
                        auto_reply_enabled,
                        auto_reply_enabled_at,
                        auto_reply_min_rating,
                        auto_reply_tone,
                        organizations!inner ( id, plan, plan_status )
                    )
                `)
                .eq("id", reviewId)
                .single();

            if (error || !row) {
                return { ok: false as const, reason: "review_not_found" };
            }
            if (row.platform !== "google" || row.response_status !== "pending") {
                return { ok: false as const, reason: "not_eligible_state" };
            }

            const biz = row.businesses as unknown as {
                id: string;
                name: string | null;
                category: string | null;
                organization_id: string;
                auto_reply_enabled: boolean;
                auto_reply_enabled_at: string | null;
                auto_reply_min_rating: number;
                auto_reply_tone: string;
                organizations: { id: string; plan: string | null; plan_status: string | null } | null;
            };

            if (!biz?.auto_reply_enabled) {
                return { ok: false as const, reason: "auto_reply_disabled" };
            }

            if (!planAllowsAutoCommenter(biz.organizations?.plan, biz.organizations?.plan_status)) {
                return { ok: false as const, reason: "plan_not_eligible" };
            }
            if (!biz.auto_reply_enabled_at) {
                return { ok: false as const, reason: "auto_reply_no_cutoff" };
            }
            if ((row.rating as number) < biz.auto_reply_min_rating) {
                return { ok: false as const, reason: "rating_below_threshold" };
            }

            const reviewedAt = row.review_date ? new Date(row.review_date as string) : null;
            if (!reviewedAt || Number.isNaN(reviewedAt.getTime())) {
                return { ok: false as const, reason: "bad_review_date" };
            }
            if (Date.now() - reviewedAt.getTime() > AUTO_REPLY_MAX_REVIEW_AGE_MS) {
                return { ok: false as const, reason: "review_too_old" };
            }
            const enabledAt = new Date(biz.auto_reply_enabled_at);
            if (Number.isNaN(enabledAt.getTime())) {
                return { ok: false as const, reason: "bad_auto_reply_enabled_at" };
            }
            if (reviewedAt.getTime() < enabledAt.getTime() - AUTO_REPLY_ENABLED_AT_SKEW_MS) {
                return { ok: false as const, reason: "review_before_auto_reply_enabled" };
            }

            const orgId = biz.organization_id;
            const limit = await checkLimit(orgId, "smart_replies");
            if (!limit.allowed) {
                return { ok: false as const, reason: "smart_reply_limit" };
            }

            const tone = (AUTO_REPLY_TONES.includes(biz.auto_reply_tone as ReplyTone)
                ? biz.auto_reply_tone
                : "professional") as ReplyTone;

            return {
                ok: true as const,
                orgId,
                businessId: biz.id,
                tone,
                businessName: biz.name || "our business",
                businessCategory: (biz.category || "local").trim() || "local",
                plan: biz.organizations?.plan,
                rating: row.rating as number,
                reviewText: (row.text as string) || "",
                selectedStaff: row.selected_staff as string[] | null,
            };
        });

        if (!gate.ok) {
            logger.info({ reviewId, reason: gate.reason }, "[AutoReply] Skip");
            return { status: "skipped", reason: gate.reason };
        }

        const draft = await step.run("generate-draft", async () => {
            return await generateReplyDraftText({
                businessName: gate.businessName,
                businessCategory: gate.businessCategory,
                rating: gate.rating,
                reviewText: gate.reviewText,
                selectedStaff: gate.selectedStaff,
                tone: gate.tone,
                plan: gate.plan,
                varietyKey: reviewId,
                rotationScope: gate.businessId,
            });
        });

        if (!draft || draft.length < 3) {
            return { status: "skipped", reason: "empty_draft" };
        }

        await step.run("post-to-google", async () => {
            await postGoogleReplySystem(reviewId, draft);
        });

        await step.run("increment-ai-meter", async () => {
            const admin = createAdminClient();
            await admin.rpc("increment_ai_replies_used", { org_id: gate.orgId });
        });

        return { status: "completed", reviewId };
    }
);
