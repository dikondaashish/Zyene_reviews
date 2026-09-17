import { createAdminClient } from "@/lib/db/supabase/admin";
import { isLiveSamplingEnabled, isMeteredBillingLive } from "@/lib/features/aeo-surfaces";
import { autoEnrollDefaultPrompts } from "@/services/aeo/prompts/auto-enroll-default-prompts";
import { inngest } from "@/services/inngest/client";

/**
 * Performs the one-time default enrollment in a durable worker. It is gated
 * by both live sampling and billing: activating a prompt is a future paid
 * commitment even though this worker itself never calls an answer engine.
 */
export const aeoPromptEnrollmentWorker = inngest.createFunction(
    {
        id: "aeo-prompt-enrollment-worker",
        concurrency: { key: "event.data.businessId", limit: 1 },
        retries: 2,
    },
    { event: "aeo/prompt-enrollment.requested" },
    async ({ event, step }) => {
        if (!isLiveSamplingEnabled() || !isMeteredBillingLive()) {
            return { skipped: "live_sampling_or_billing_disabled" as const };
        }

        return step.run("enroll-default-prompts", () =>
            autoEnrollDefaultPrompts(createAdminClient(), event.data.businessId)
        );
    }
);
