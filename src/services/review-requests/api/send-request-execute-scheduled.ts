import { logger } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";
import { apiOk, apiError } from "@/app/api/_shared/responses";
import { inngest } from "@/services/inngest/client";
import type { SendRequestPrepared } from "./send-request-execute-prepare";

export async function executeScheduledSendReviewRequest(prepared: SendRequestPrepared) {
    const { supabase, businessId, phoneNorm, emailNorm, channel, displayName, scheduleDate } = prepared;
    if (!scheduleDate) {
        return apiError("Invalid schedule date", { status: 400 });
    }

    const { data: requestRecord, error: insertError } = await supabase
        .from("review_requests")
        .insert({
            business_id: businessId,
            customer_name: displayName === "there" ? null : displayName,
            customer_phone: phoneNorm || null,
            customer_email: emailNorm,
            channel,
            status: "queued",
            scheduled_for: scheduleDate.toISOString(),
            trigger_source: "manual",
        })
        .select()
        .single();

    if (insertError) {
        logger.error({ err: insertError }, "Insert scheduled request error:");
        Sentry.captureException(insertError, { tags: { route: "requests-send", step: "insert_scheduled" } });
        return apiError("Failed to schedule request", { status: 500 });
    }

    await inngest.send({
        name: "review-request/scheduled.send",
        data: {
            reviewRequestId: requestRecord.id,
            sendAt: scheduleDate.toISOString(),
            trigger: "api",
        },
    });

    return apiOk(requestRecord);
}
