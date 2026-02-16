import { createAdminClient } from "@/lib/supabase/admin";
import { twilioClient } from "@/lib/twilio/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const Body = formData.get("Body")?.toString().trim().toUpperCase() || "";
        const From = formData.get("From")?.toString() || "";

        if (!From) return new NextResponse("Values missing", { status: 400 });

        const admin = createAdminClient();
        const messaging = twilioClient.messages; // Or simpler TwiML?
        // Twilio expects TwiML response or just 200 OK.

        let replyText = "";

        if (Body === "STOP" || Body === "STOPALL" || Body === "UNSUBSCRIBE" || Body === "CANCEL" || Body === "END" || Body === "QUIT") {
            // Add to Opt Out
            await admin.from("sms_opt_outs").upsert({ phone_number: From });
            replyText = "You have been unsubscribed from Zyene Ratings alerts. No further messages will be sent.";
        } else if (Body === "START" || Body === "YES" || Body === "UNSTOP") {
            // Remove from Opt Out
            await admin.from("sms_opt_outs").delete().eq("phone_number", From);
            replyText = "You have been re-subscribed to Zyene Ratings alerts.";
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
        console.error("Twilio Webhook Error:", error);
        return new NextResponse("Error", { status: 500 });
    }
}
