import { NextResponse, type NextRequest } from "next/server";
import { sendOutboundReviewRequest } from "@/lib/review-requests/send-outbound";
import { authenticateGenericWebhookKey } from "./generic-webhook-auth";
import { withGenericWebhookCors, genericWebhookOptionsResponse } from "./generic-webhook-cors";
import { parseGenericWebhookBody } from "./generic-webhook-body";

export function handleGenericWebhookOptions() {
    return genericWebhookOptionsResponse();
}

export async function handleGenericWebhookPost(req: NextRequest) {
    const auth = await authenticateGenericWebhookKey(req);
    if (!auth.ok) return auth.response;

    let body: Record<string, unknown> | null = null;
    try {
        const text = await req.text();
        body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
        return withGenericWebhookCors(
            NextResponse.json(
                { success: false, error: "Invalid JSON payload." },
                { status: 400 },
            ),
        );
    }

    const { customerName, customerEmail, customerPhone, channel } = parseGenericWebhookBody(body);

    if (!channel) {
        return withGenericWebhookCors(
            NextResponse.json(
                {
                    success: false,
                    error: "Invalid channel. Use 'sms', 'email', 'link', or 'both'.",
                },
                { status: 400 },
            ),
        );
    }

    if (!customerPhone && !customerEmail && channel !== "link") {
        return withGenericWebhookCors(
            NextResponse.json(
                {
                    success: false,
                    error: "Provide a phone or email field (e.g. 'phone' / 'email' / 'name').",
                },
                { status: 400 },
            ),
        );
    }

    const result = await sendOutboundReviewRequest({
        businessId: auth.businessId,
        channel,
        customerName,
        customerPhone,
        customerEmail,
        triggerSource: "zapier",
    });

    if (!result.success) {
        return withGenericWebhookCors(
            NextResponse.json(
                { success: false, error: result.errorMessage },
                { status: result.code },
            ),
        );
    }

    return withGenericWebhookCors(
        NextResponse.json({
            success: true,
            data: {
                requestId: result.requestId,
                status: result.status,
                channel: result.channel,
                reviewLink: result.reviewLink,
                warning: result.errorMessage,
            },
        }),
    );
}
