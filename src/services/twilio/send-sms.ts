import { logger } from "@/lib/logger";
import { getTwilioClient, TWILIO_MESSAGING_SERVICE_SID, TWILIO_PHONE_NUMBER } from "./client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { buildTwilioMessageParams, ensureSmsOptOutText } from "./message-params";

type SendSmsOptions = {
    /** Public URL Twilio POSTs delivery status to (review requests only). */
    statusCallback?: string;
};

export async function sendSMS(
    to: string, body: string, options: SendSmsOptions = {},
): Promise<{ sent: boolean; sid?: string; error?: string }> {
    const messageParams = buildTwilioMessageParams(to, ensureSmsOptOutText(body), {
        messagingServiceSid: TWILIO_MESSAGING_SERVICE_SID,
        phoneNumber: TWILIO_PHONE_NUMBER,
        statusCallback: options.statusCallback,
    });

    if (!messageParams) {
        return { sent: false, error: "Twilio sender not configured" };
    }

    try {
        const admin = createAdminClient();

        // Last-line opt-out check. `.single()` errored (and was ignored) when a number had
        // two opt-out rows, so the opt-out was skipped; any match counts, and an unreadable
        // opt-out list blocks the send rather than risk texting someone who said STOP.
        const { data: optOuts, error: optOutError } = await admin
            .from("sms_opt_outs")
            .select("phone_number")
            .eq("phone_number", to)
            .limit(1);

        if (optOutError) {
            logger.error({ err: optOutError }, "Twilio opt-out check failed; not sending");
            return { sent: false, error: "Could not verify SMS opt-out status" };
        }
        if (optOuts && optOuts.length > 0) {
            return { sent: false, error: "Recipient opted out" };
        }

        const message = await getTwilioClient().messages.create(messageParams);

        return { sent: true, sid: message?.sid };
    } catch (error: unknown) {
        logger.error({ err: error }, "Twilio Send Error:");
        return { sent: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
