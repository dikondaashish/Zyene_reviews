import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { NextResponse } from "next/server";
import twilio from "twilio";
import { z } from "zod";

const inboundSchema = z.object({
    From: z.string().regex(/^\+[1-9]\d{7,14}$/),
    Body: z.string().default(""),
    OptOutType: z.enum(["STOP", "START", "HELP"]).optional(),
});

export async function POST(request: Request) {
    try {
        const rawBody = await request.text();
        const formData = new URLSearchParams(rawBody);
        const signature = request.headers.get("x-twilio-signature");

        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const webhookUrl =
            process.env.TWILIO_WEBHOOK_URL ||
            request.url;

        if (!authToken || !signature) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const params: Record<string, string> = {};
        for (const [k, v] of formData.entries()) params[k] = v;
        const valid = twilio.validateRequest(authToken, signature, webhookUrl, params);
        if (!valid) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const parsed = inboundSchema.safeParse(params);
        if (!parsed.success) return new NextResponse("Invalid message", { status: 400 });
        const { From, OptOutType } = parsed.data;
        const command = OptOutType || parsed.data.Body.trim().toUpperCase();

        let replyText = "";

        if (["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT", "REVOKE", "OPTOUT"].includes(command)) {
            const { error } = await createAdminClient().from("sms_opt_outs").upsert({ phone_number: From });
            if (error) throw error;
            replyText = "You have been unsubscribed from Zyene Reviews alerts. No further messages will be sent.";
        } else if (["START", "YES", "UNSTOP"].includes(command)) {
            const { error } = await createAdminClient().from("sms_opt_outs").delete().eq("phone_number", From);
            if (error) throw error;
            replyText = "You have been re-subscribed to Zyene Reviews alerts.";
        } else if (command === "HELP" || command === "INFO") {
            replyText = "Zyene Reviews: For help, contact support@zyenereviews.com. Reply STOP to unsubscribe. Message and data rates may apply.";
        } else {
            // Unknown command
            replyText = "Unknown command. Reply STOP to unsubscribe or START to resubscribe.";
        }

        // Send reply via TwiML XML
        // Advanced Opt-Out has already replied; acknowledge without another SMS.
        const response = new twilio.twiml.MessagingResponse();
        if (!OptOutType) response.message(replyText);
        const xml = response.toString();

        return new NextResponse(xml, {
            headers: {
                "Content-Type": "text/xml",
            },
        });
    } catch (error) {
        logger.error({ err: error }, "Twilio Webhook Error:");
        return new NextResponse("Error", { status: 500 });
    }
}
