import { logger } from "@/lib/logger";
import type { SupabaseClient } from "@supabase/supabase-js";
import * as Sentry from "@sentry/nextjs";

export async function patchRequest(
    admin: SupabaseClient,
    businessId: string,
    requestId: string,
    patch: Record<string, unknown>,
) {
    const { error } = await admin.from("review_requests").update(patch).eq("id", requestId).eq("business_id", businessId);
    if (error) {
        logger.error({ err: error }, "[scheduled-queue] patch review_requests:");
        Sentry.captureException(error, { tags: { route: "scheduled-review-queue", step: "patch" } });
    }
}
