import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { recordReviewRequestOpenForRef } from "@/lib/review-requests/record-review-request-open";
import { verifyReviewTracking } from "@/lib/review-requests/tracking-token";
import { createPublicReviewOpen } from "@/services/review-flow/create-public-review-open";
import {
    clientIpFrom, publicReviewOpenBusinessRateLimit, publicReviewOpenIpRateLimit,
} from "@/lib/auth/rate-limit";
import { z } from "zod";

const openSchema = z.object({
    businessId: z.string().uuid(),
    requestId: z.string().uuid().optional(),
    token: z.string().optional(),
    openToken: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = openSchema.safeParse(body);
        if (!parsed.success) {
            logger.warn({ issues: parsed.error.flatten() }, "[track/review-open] invalid payload");
            return NextResponse.json({ error: "Invalid open tracking payload" }, { status: 400 });
        }

        const { businessId, requestId, token, openToken } = parsed.data;

        if (requestId) {
            if (!verifyReviewTracking(requestId, businessId, token)) {
                return NextResponse.json({ error: "Invalid tracking token" }, { status: 403 });
            }
            const result = await recordReviewRequestOpenForRef({ businessId, requestId });
            if (!result.ok) {
                if (result.reason === "not_found") {
                    return NextResponse.json({ error: "Review request not found" }, { status: 404 });
                }
                if (result.reason === "lookup_failed") {
                    return NextResponse.json({ error: "Review request lookup failed" }, { status: 500 });
                }
                return NextResponse.json({ error: "Failed to track open" }, { status: 500 });
            }
            return NextResponse.json({ success: true, requestId, token });
        }

        if (!verifyReviewTracking("public-open", businessId, openToken)) {
            return NextResponse.json({ error: "Invalid review page token" }, { status: 403 });
        }
        try {
            const [ipLimit, businessLimit] = await Promise.all([
                publicReviewOpenIpRateLimit.limit(clientIpFrom(request)),
                publicReviewOpenBusinessRateLimit.limit(businessId),
            ]);
            if (!ipLimit.success || !businessLimit.success) {
                return NextResponse.json({ error: "Too many review opens" }, { status: 429 });
            }
        } catch {
            return NextResponse.json({ error: "Review tracking unavailable" }, { status: 503 });
        }

        return NextResponse.json({ success: true, ...(await createPublicReviewOpen(businessId)) });
    } catch (error: unknown) {
        logger.error({ err: error }, "Open tracking error");
        return NextResponse.json({ error: "Failed to track open" }, { status: 500 });
    }
}
