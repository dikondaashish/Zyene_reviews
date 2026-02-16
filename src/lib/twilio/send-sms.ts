import { twilioClient, TWILIO_PHONE_NUMBER } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";

export async function sendSMS(to: string, body: string) {
    if (!TWILIO_PHONE_NUMBER) {
        return { sent: false, error: "Twilio phone number not configured" };
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
            console.log(`[SMS] Skipped sending to ${to} (Opted out)`);
            return { sent: false, error: "Recipient opted out" };
        }

        await twilioClient.messages.create({
            body,
            from: TWILIO_PHONE_NUMBER,
            to,
        });

        return { sent: true };
    } catch (error: any) {
        console.error("Twilio Send Error:", error);
        return { sent: false, error: error.message };
    }
}
