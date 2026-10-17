import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { sendOutboundReviewRequest } from "@/lib/review-requests/send-outbound";
import { authenticateGenericWebhookKey } from "./generic-webhook-auth";
import { withGenericWebhookCors, genericWebhookOptionsResponse } from "./generic-webhook-cors";
import { parseGenericWebhookBody } from "./generic-webhook-body";
import { applyGenericWebhookTiming } from "./generic-webhook-schedule";
import { parseGenericWebhookTiming } from "./generic-webhook-timing";

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

    // Payment-style sends honour the Review Request Settings delay + minimum; "link" only returns a URL.
    if (channel !== "link") {
        const timing = parseGenericWebhookTiming(body ?? {});
        if (!timing.ok) {
            return withGenericWebhookCors(
                NextResponse.json({ success: false, error: timing.error }, { status: 400 }),
            );
        }
        try {
            const handled = await applyGenericWebhookTiming({
                businessId: auth.businessId,
                channel,
                contact: { name: customerName, email: customerEmail, phone: customerPhone },
                timing: timing.timing,
            });
            if (handled) return handled;
        } catch (err: unknown) {
            logger.error({ err, businessId: auth.businessId }, "[generic-webhook] timing/schedule failed");
            return withGenericWebhookCors(
                NextResponse.json(
                    { success: false, error: "Could not schedule the review request." },
                    { status: 500 },
                ),
            );
        }
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
