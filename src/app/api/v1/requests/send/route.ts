import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { createAdminClient } from "@/lib/db/supabase/admin";
import { sendSMS } from "@/services/twilio/send-sms";
import { authenticateApiKey, corsPreflight, withCors } from "@/app/api/v1/_lib/auth";

const bodySchema = z.object({
    customerName: z.string().max(200).optional(),
    customerPhone: z.string().max(30),
    customerEmail: z.string().email().max(320).optional(),
    channel: z.enum(["sms", "email", "link"]).optional().default("sms"),
});

export async function OPTIONS() {
    return corsPreflight();
}

export async function POST(req: NextRequest) {
    const auth = await authenticateApiKey(req);
    if (!auth.ok) return auth.response;

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
        return withCors(
            NextResponse.json(
                { success: false, error: parsed.error.issues[0]?.message || "Invalid request body." },
                { status: 400 }
            )
        );
    }

    const admin = createAdminClient();
    const { customerName, customerPhone, customerEmail, channel } = parsed.data;

    const requestId = randomUUID();
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const protocol = rootDomain.includes("localhost") ? "http" : "https";
    const reviewLink = `${protocol}://${rootDomain}/${auth.businessSlug || ""}?ref=${requestId}`;

    let status: "sent" | "failed" | "queued" = channel === "link" ? "sent" : "queued";
    let errorMessage: string | null = null;
    let sentAt: string | null = null;

    if (channel === "sms") {
        const msg = `Hi ${customerName || "there"}! Thanks for visiting ${auth.businessName || "our business"}. We'd love your feedback: ${reviewLink}`;
        const result = await sendSMS(customerPhone, msg);
        if (result.sent) {
            status = "sent";
            sentAt = new Date().toISOString();
        } else {
            status = "failed";
            errorMessage = result.error || "SMS delivery failed.";
        }
    } else if (channel === "email") {
        status = "queued";
        errorMessage = "Email sending is not configured yet. Use channel 'sms' or 'link'.";
    } else if (channel === "link") {
        status = "sent";
        sentAt = new Date().toISOString();
    }

    const payload = {
        id: requestId,
        business_id: auth.businessId,
        customer_name: customerName || null,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        channel,
        status,
        sent_at: sentAt,
        error_message: errorMessage,
    };

    const { error: insertError } = await admin.from("review_requests").insert(payload);
    if (insertError) {
        return withCors(
            NextResponse.json(
                { success: false, error: "Failed to create review request." },
                { status: 500 }
            )
        );
    }

    await admin.rpc("increment_customer_requests", {
        p_business_id: auth.businessId,
        p_phone: customerPhone,
    });

    return withCors(
        NextResponse.json({
            success: status !== "failed",
            data: {
                requestId,
                status,
                reviewLink,
                channel,
                error: errorMessage,
            },
        })
    );
}
