import { logger } from "@/lib/logger";
import { inngest } from "@/services/inngest/client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { generateReplyDraftText } from "@/domains/ai/services/generate-reply-draft";
import { postGoogleReplySystem } from "@/services/reviews/post-google-reply-system";
import { evaluateAutoReplyGate } from "@/services/reviews/auto-reply-gate";
import { queueReplyDraft, renderReplyTemplate } from "@/services/reviews/reply-rules";
import { notifyReplyApprovers } from "@/services/reviews/reply-approval-notify";

export const processAutoReplyReview = inngest.createFunction(
    {
        id: "process-auto-reply-review",
        name: "Reply to Google review (rules / AI)",
        concurrency: { limit: 1, key: "event.data.reviewId" },
        retries: 2,
    },
    { event: "review/auto-reply" },
    async ({ event, step }) => {
        const { reviewId } = event.data;

        const gate = await step.run("gate-check", () => evaluateAutoReplyGate(createAdminClient(), reviewId));
        if (!gate.ok) {
            logger.info({ reviewId, reason: gate.reason }, "[AutoReply] Skip");
            return { status: "skipped", reason: gate.reason };
        }

        const usesTemplate = gate.rule.action === "template" || (gate.rule.action === "approval" && !gate.aiAllowed);
        const text = await step.run("compose-reply", async () => {
            if (usesTemplate && "templateBody" in gate.rule && gate.rule.templateBody) {
                return renderReplyTemplate(gate.rule.templateBody, { reviewerName: gate.reviewerName, businessName: gate.businessName });
            }
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
        if (!text || text.length < 3) return { status: "skipped", reason: "empty_draft" };

        if (gate.rule.action === "approval") {
            const draftId = await step.run("queue-for-approval", () => queueReplyDraft(createAdminClient(), {
                businessId: gate.businessId, reviewId, rating: gate.rating, text, source: usesTemplate ? "template" : "ai",
            }));
            if (draftId) await step.run("notify-approvers", () => notifyReplyApprovers(createAdminClient(), gate.businessId, draftId));
        } else {
            // postGoogleReplySystem re-checks the review is still unanswered right before posting.
            const posted = await step.run("post-to-google", () => postGoogleReplySystem(reviewId, text));
            if (!posted) return { status: "skipped", reason: "already_answered" };
        }

        if (!usesTemplate) {
            await step.run("increment-ai-meter", async () => {
                await createAdminClient().rpc("increment_ai_replies_used", { org_id: gate.orgId });
            });
        }
        return { status: gate.rule.action === "approval" ? "queued_for_approval" : "completed", reviewId };
    }
);
