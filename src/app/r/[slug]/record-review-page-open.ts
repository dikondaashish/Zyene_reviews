import { logger } from "@/lib/logger";
import { recordReviewRequestOpenForRef } from "@/lib/review-requests/record-review-request-open";
import { verifyReviewTracking } from "@/lib/review-requests/tracking-token";
import { z } from "zod";

export async function recordReviewPageOpen(
    businessId: string, requestId: string | undefined, token?: string,
) {
    if (!requestId) return;

    const refParse = z.string().uuid().safeParse(requestId.trim());
    if (!refParse.success) return;
    if (!verifyReviewTracking(refParse.data, businessId, token)) return;

    const tracked = await recordReviewRequestOpenForRef({
        businessId,
        requestId: refParse.data,
    });
    if (!tracked.ok) {
        logger.error({ err: tracked }, "[Review Flow] server open tracking failed");
    }
}
