import { NextResponse } from "next/server";
import twilio from "twilio";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { applyDeliveryEvent } from "@/lib/review-requests/message-ledger";

/**
 * Twilio message status callbacks for review-request SMS. Signature-verified; matched to
 * review_request_messages by MessageSid. Duplicate / out-of-order callbacks are ignored by
 * rank, and the request-level status is only advanced (never moved back from clicked etc.).
 */
const statusSchema = z.object({
    MessageSid: z.string().regex(/^(SM|MM)[0-9a-fA-F]{32}$/),
    MessageStatus: z.string().min(1).max(40),
    ErrorCode: z.string().max(10).optional(),
});

const TRACKED: Record<string, "sent" | "delivered" | "undelivered" | "failed"> = {
    sent: "sent", delivered: "delivered", undelivered: "undelivered", failed: "failed",
};

export function twilioStatusWebhookUrl(request: Request): string {
    return process.env.TWILIO_STATUS_CALLBACK_URL?.trim() || request.url;
}

export async function handleTwilioStatusCallback(request: Request) {
    const rawBody = await request.text();
    const params = Object.fromEntries(new URLSearchParams(rawBody).entries());
    const signature = request.headers.get("x-twilio-signature");
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!authToken || !signature || !twilio.validateRequest(authToken, signature, twilioStatusWebhookUrl(request), params)) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const parsed = statusSchema.safeParse(params);
    if (!parsed.success) return new NextResponse("Invalid status", { status: 400 });

    const status = TRACKED[parsed.data.MessageStatus.toLowerCase()];
    // queued / sending / accepted etc. carry no new fact; acknowledge so Twilio stops retrying.
    if (!status) return new NextResponse(null, { status: 204 });

    const reason = parsed.data.ErrorCode ? `Carrier error ${parsed.data.ErrorCode}` : status;
    const admin = createAdminClient();
    const message = await applyDeliveryEvent(admin, {
        channel: "sms", providerMessageId: parsed.data.MessageSid, status, reason,
    });
    if (!message) return new NextResponse(null, { status: 204 });

    const now = new Date().toISOString();
    if (status === "delivered") {
        await admin.from("review_requests").update({ sms_status: "delivered", delivered_at: now })
            .eq("id", message.review_request_id).eq("business_id", message.business_id).in("sms_status", ["sent"]);
        await admin.from("review_requests").update({ status: "delivered" })
            .eq("id", message.review_request_id).eq("business_id", message.business_id).eq("status", "sent");
    } else if (status === "undelivered" || status === "failed") {
        await admin.from("review_requests").update({ sms_status: "undelivered", error_message: `SMS not delivered (${reason})` })
            .eq("id", message.review_request_id).eq("business_id", message.business_id).in("sms_status", ["sent", "delivered"]);
        logger.warn({ requestId: message.review_request_id, reason }, "[twilio-status] SMS not delivered");
    }
    return new NextResponse(null, { status: 204 });
}
