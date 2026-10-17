import { logger } from "@/lib/logger";
import { inngest } from "../client";
import { posDelayedSendSchema, runPosDelayedSend } from "@/services/review-requests/pos-delayed-send";

/**
 * POS / Zapier review requests honour `businesses.review_request_delay_minutes`:
 * the trigger enqueues this event with `sendAt`, we sleep, then send with
 * fresh guards.
 */
export const sendDelayedPosReviewRequest = inngest.createFunction(
    {
        id: "send-delayed-pos-review-request",
        name: "Send Delayed POS Review Request",
        concurrency: { limit: 5 },
    },
    { event: "review-request/pos.delayed-send" },
    async ({ event, step }) => {
        const parsed = posDelayedSendSchema.safeParse(event.data);
        if (!parsed.success) {
            logger.warn({ issues: parsed.error.issues }, "[pos-delayed-send] invalid event payload");
            return { status: "invalid_payload" };
        }
        const data = parsed.data;

        await step.sleepUntil("post-payment-delay", new Date(data.sendAt));

        const status = await step.run("send-review-request", () => runPosDelayedSend(data));
        return { status };
    },
);
