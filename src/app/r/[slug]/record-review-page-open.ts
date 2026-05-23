import { logger } from "@/lib/logger";
import { recordReviewRequestOpenForRef } from "@/lib/review-requests/record-review-request-open";
import { z } from "zod";

export async function recordReviewPageOpen(businessId: string, requestId: string | undefined) {
    if (!requestId) return;

    const refParse = z.string().uuid().safeParse(requestId.trim());
    if (!refParse.success) return;

    const tracked = await recordReviewRequestOpenForRef({
        businessId,
        requestId: refParse.data,
    });
    if (!tracked.ok) {
        logger.error({ err: tracked }, "[Review Flow] server open tracking failed");
    }
}
