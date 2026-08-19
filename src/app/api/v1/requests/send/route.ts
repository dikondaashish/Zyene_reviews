import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { authenticateApiKey, corsPreflight, withCors } from "@/app/api/v1/_lib/auth";
import { sendOutboundReviewRequest } from "@/lib/review-requests/send-outbound";

const bodySchema = z.object({
    customerName: z.string().max(200).optional().or(z.literal("")),
    customerPhone: z.string().max(40).optional().or(z.literal("")),
    customerEmail: z.string().max(320).optional().or(z.literal("")),
    channel: z.enum(["sms", "email", "link", "both"]).optional().default("sms"),
});

export async function OPTIONS() {
    return corsPreflight();
}

export async function POST(req: NextRequest) {
    const auth = await authenticateApiKey(req, "review_requests:write");
    if (!auth.ok) return auth.response;

    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
        return withCors(
            NextResponse.json(
                {
                    success: false,
                    error: parsed.error.issues[0]?.message || "Invalid request body.",
                },
                { status: 400 },
            ),
        );
    }

    const result = await sendOutboundReviewRequest({
        businessId: auth.businessId,
        channel: parsed.data.channel,
        customerName: parsed.data.customerName || null,
        customerPhone: parsed.data.customerPhone || null,
        customerEmail: parsed.data.customerEmail || null,
        triggerSource: "zapier",
    });

    if (!result.success) {
        return withCors(
            NextResponse.json(
                { success: false, error: result.errorMessage },
                { status: result.code },
            ),
        );
    }

    return withCors(
        NextResponse.json({
            success: true,
            data: {
                requestId: result.requestId,
                status: result.status,
                channel: result.channel,
                reviewLink: result.reviewLink,
                /** Set when one leg of `both` failed but the request is still considered sent. */
                warning: result.errorMessage,
            },
        }),
    );
}
