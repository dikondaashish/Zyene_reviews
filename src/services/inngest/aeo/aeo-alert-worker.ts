import { inngest } from "@/services/inngest/client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { isLiveAlertingEnabled } from "@/lib/features/aeo-surfaces";
import { runAlertDetectionForBusiness } from "@/services/aeo/alerting/run-alert-detection";

/**
 * F8: one business's alert check. Detection-only — sending digests is a
 * separate worker (aeo-alert-digest-worker.ts) on its own schedule, so a
 * detection retry can never re-send an email that already went out.
 */
export const aeoAlertWorker = inngest.createFunction(
    {
        id: "aeo-alert-worker",
        concurrency: { key: "event.data.businessId", limit: 1 },
        retries: 2,
    },
    { event: "aeo/alert-check.requested" },
    async ({ event, step }) => {
        if (!isLiveAlertingEnabled()) {
            return { skipped: "live_alerting_disabled" as const };
        }

        const { businessId, organizationId } = event.data;
        const admin = createAdminClient();

        const result = await step.run("detect-alerts", () =>
            runAlertDetectionForBusiness(admin, { businessId, organizationId })
        );

        return result;
    }
);
