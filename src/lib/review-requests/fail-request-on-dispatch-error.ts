import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

/**
 * A request is inserted as "sending" before dispatch. If dispatch throws (a DB error in
 * the send guard or message claim), nothing else moves it: the scheduled cron only picks
 * "queued", so it stayed "sending" forever and counted against the monthly cap. Mark it
 * failed with the reason instead; the message ledger still prevents a double send on retry.
 */
export async function failRequestAfterDispatchError(
    admin: SupabaseClient,
    requestId: string,
    businessId: string,
    error: unknown,
): Promise<void> {
    logger.error({ err: error, requestId }, "[review-request] dispatch threw; marking request failed");
    const { error: updateError } = await admin
        .from("review_requests")
        .update({ status: "failed", error_message: "Sending failed unexpectedly. Please try again." })
        .eq("id", requestId)
        .eq("business_id", businessId)
        .eq("status", "sending");
    if (updateError) logger.error({ err: updateError, requestId }, "[review-request] could not mark request failed");
}
