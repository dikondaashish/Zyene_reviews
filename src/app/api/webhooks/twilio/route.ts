import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(request: Request) {
    try {
        const rawBody = await request.text();
        const formData = new URLSearchParams(rawBody);
        const Body = formData.get("Body")?.trim().toUpperCase() || "";
        const From = formData.get("From") || "";
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

        if (!From) return new NextResponse("Values missing", { status: 400 });

        const admin = createAdminClient();

        let replyText = "";

        if (Body === "STOP" || Body === "STOPALL" || Body === "UNSUBSCRIBE" || Body === "CANCEL" || Body === "END" || Body === "QUIT") {
            // Add to Opt Out
            await admin.from("sms_opt_outs").upsert({ phone_number: From });
            replyText = "You have been unsubscribed from Zyene Reviews alerts. No further messages will be sent.";
        } else if (Body === "START" || Body === "YES" || Body === "UNSTOP") {
            // Remove from Opt Out
            await admin.from("sms_opt_outs").delete().eq("phone_number", From);
            replyText = "You have been re-subscribed to Zyene Reviews alerts.";
        } else {
            // Unknown command
            replyText = "Unknown command. Reply STOP to unsubscribe or START to resubscribe.";
        }

        // Send reply via TwiML XML
        const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${replyText}</Message></Response>`;

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
