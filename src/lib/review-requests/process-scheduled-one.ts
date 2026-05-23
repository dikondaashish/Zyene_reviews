import { logger } from "@/lib/logger";
import type { SupabaseClient } from "@supabase/supabase-js";
import * as Sentry from "@sentry/nextjs";
import type { DueRow } from "./scheduled-queue-types";
import { patchRequest } from "./scheduled-queue-patch";
import { prepareScheduledSendRow } from "./process-scheduled-one-prep";
import { sendPreparedScheduledRow } from "./process-scheduled-one-send";

export async function processOneScheduled(admin: SupabaseClient, row: DueRow): Promise<"sent" | "failed" | "skipped"> {
    const { data: claimed, error: claimErr } = await admin
        .from("review_requests")
        .update({ status: "processing" })
        .eq("id", row.id)
        .eq("status", "queued")
        .select("id, business_id, customer_name, customer_phone, customer_email, channel")
        .maybeSingle();

    if (claimErr || !claimed) {
        return "skipped";
    }

    const businessId = row.business_id;
    const requestId = row.id;

    try {
        const prepared = await prepareScheduledSendRow(admin, row, businessId, requestId);
        if (prepared === "failed") {
            return "failed";
        }
        return await sendPreparedScheduledRow(admin, prepared);
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unexpected error";
        logger.error({ err: e }, "[scheduled-queue] processOne:");
        Sentry.captureException(e, { tags: { route: "scheduled-review-queue", step: "processOne" } });
        await patchRequest(admin, businessId, requestId, {
            status: "failed",
            error_message: msg,
            sent_at: null,
        });
        return "failed";
    }
}
