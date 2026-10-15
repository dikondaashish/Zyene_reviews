import * as z from "zod";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { sendOutboundReviewRequest } from "@/lib/review-requests/send-outbound";
import { getSquareEnvironment } from "@/services/square/config";
import { sendAndRecordSquarePayment } from "@/services/square/dispatch-payment-send";
import {
    findSquarePaymentEvent,
    patchSquarePaymentEvent,
} from "@/services/square/payment-event-store";

const sendAt = z.iso.datetime({ offset: true });

/** Payload of `review-request/pos.delayed-send` (validated again when the job runs). */
export const posDelayedSendSchema = z.discriminatedUnion("source", [
    z.object({
        source: z.literal("square"),
        businessId: z.string().min(1),
        merchantId: z.string().min(1),
        paymentId: z.string().min(1),
        sendAt,
    }),
    z.object({
        source: z.literal("zapier"),
        businessId: z.string().min(1),
        channel: z.enum(["sms", "email", "both"]),
        contact: z.object({
            name: z.string().nullable(),
            email: z.string().nullable(),
            phone: z.string().nullable(),
        }),
        sendAt,
    }),
]);

export type PosDelayedSendData = z.infer<typeof posDelayedSendSchema>;

/**
 * Runs once the post-payment delay has elapsed. Every guard (30-day cap,
 * opt-outs, plan limits, auto-send toggle, connection) is re-read now, not at
 * payment time.
 */
export async function runPosDelayedSend(
    data: PosDelayedSendData,
    admin = createAdminClient(),
): Promise<string> {
    if (data.source === "zapier") {
        const result = await sendOutboundReviewRequest({
            admin,
            businessId: data.businessId,
            channel: data.channel,
            customerName: data.contact.name,
            customerEmail: data.contact.email,
            customerPhone: data.contact.phone,
            triggerSource: "zapier",
        });
        if (!result.success) {
            logger.info(
                { businessId: data.businessId, code: result.code, reason: result.errorMessage },
                "[pos-delayed-send] zapier send not completed",
            );
            return result.code === 500 ? "send_failed" : "skipped_guard";
        }
        return "sent";
    }

    const ref = { merchantId: data.merchantId, paymentId: data.paymentId };
    const row = await findSquarePaymentEvent(admin, data.merchantId, data.paymentId);
    if (!row || row.status !== "sending" || row.review_request_id) {
        logger.info({ ...ref, status: row?.status ?? null }, "[pos-delayed-send] square row no longer pending");
        return "not_pending";
    }

    const { data: connection } = await admin
        .from("square_connections")
        .select("business_id, auto_send_enabled, environment")
        .eq("merchant_id", data.merchantId)
        .eq("business_id", data.businessId)
        .eq("environment", getSquareEnvironment())
        .is("disconnected_at", null)
        .maybeSingle();

    if (!connection) {
        await patchSquarePaymentEvent(admin, ref, {
            status: "skipped_disabled",
            error_message: "Square was disconnected before the delayed send.",
        });
        return "skipped_disabled";
    }

    return sendAndRecordSquarePayment({
        admin,
        event: ref,
        businessId: connection.business_id,
        autoSendEnabled: connection.auto_send_enabled,
        environment: connection.environment,
        contact: { email: row.customer_email, phone: row.customer_phone, name: row.customer_name },
    });
}
