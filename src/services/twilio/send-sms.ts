import { logger } from "@/lib/logger";
import { getTwilioClient, TWILIO_MESSAGING_SERVICE_SID, TWILIO_PHONE_NUMBER } from "./client";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { buildTwilioMessageParams, ensureSmsOptOutText } from "./message-params";

export async function sendSMS(to: string, body: string) {
    const messageParams = buildTwilioMessageParams(to, ensureSmsOptOutText(body), {
        messagingServiceSid: TWILIO_MESSAGING_SERVICE_SID,
        phoneNumber: TWILIO_PHONE_NUMBER,
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

        await getTwilioClient().messages.create(messageParams);

        return { sent: true };
    } catch (error: unknown) {
        logger.error({ err: error }, "Twilio Send Error:");
        return { sent: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
