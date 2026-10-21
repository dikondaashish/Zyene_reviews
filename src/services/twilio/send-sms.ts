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

        // Check Opt-out
        const { data: optOut } = await admin
            .from("sms_opt_outs")
            .select("phone_number")
            .eq("phone_number", to)
            .single();

        if (optOut) {
            return { sent: false, error: "Recipient opted out" };
        }

        const message = await getTwilioClient().messages.create(messageParams);

        return { sent: true, sid: message?.sid };
    } catch (error: unknown) {
        logger.error({ err: error }, "Twilio Send Error:");
        return { sent: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
