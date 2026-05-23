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

export const processScheduledReviewRequest = inngest.createFunction(
    {
        id: "process-scheduled-review-request",
        name: "Process Scheduled Review Request",
        concurrency: {
            // Inngest free/hobby plans cap per-function concurrency at 5; higher values fail sync.
            limit: 5,
        },
    },
    { event: "review-request/scheduled.send" },
    async ({ event, step }: { event: { data: { reviewRequestId: string; sendAt: string } }; step: any }) => {
        const admin = createAdminClient();
        const reviewRequestId = event.data.reviewRequestId;
        const sendAtIso = event.data.sendAt;

        const sendAt = new Date(sendAtIso);
        if (Number.isNaN(sendAt.getTime())) {
            throw new Error(`Invalid sendAt: ${sendAtIso}`);
        }

        // 1) Wait until scheduled time
        await step.run("sleep-until-send", async () => {
            if (sendAt.getTime() > Date.now()) {
                // Inngest supports sleepUntil; step is typed as any here.
                await step.sleepUntil("scheduled-wait", sendAt);
            }
        });

        // 2) Lock to prevent double-send (10 minutes)
        const lockKey = `lock:review-request:${reviewRequestId}`;
        const locked = await step.run("acquire-lock", async () => acquireLock(lockKey, 600));
        if (!locked) {
            return { status: "locked" };
        }

        try {
            // 3) Load row (must be queued) and process
            const row = await step.run("fetch-request", async () => {
                const { data } = await admin
                    .from("review_requests")
                    .select("id, business_id, customer_name, customer_phone, customer_email, channel, status")
                    .eq("id", reviewRequestId)
                    .maybeSingle();
                return data as
                    | {
                          id: string;
                          business_id: string;
                          customer_name: string | null;
                          customer_phone: string | null;
                          customer_email: string | null;
                          channel: string;
                          status: string;
                      }
                    | null;
            });

            if (!row) {
                return { status: "missing" };
            }
            if (row.status !== "queued") {
                return { status: "not_queued", current: row.status };
            }

            const result = await step.run("send-scheduled", async () => processOneScheduled(admin, row));
            return { status: result };
        } finally {
            await step.run("release-lock", async () => releaseLock(lockKey));
        }
    },
);
