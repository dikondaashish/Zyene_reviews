import { logger } from "@/lib/logger";
import { syncRateLimit } from "@/lib/auth/rate-limit";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { syncFacebookReviewsForPlatform } from "@/services/facebook/sync-service";
import { getFacebookPlatformForUser } from "@/services/facebook/sync-facebook-platform";

export async function handleFacebookSyncPost(request: Request) {
    try {
        const { supabase, user } = await requireUser();

        const { success: rateLimitSuccess } = await syncRateLimit.limit(user.id);
        if (!rateLimitSuccess) {
            throw new ApiRouteError("Sync rate limit exceeded. Please wait 1 minute.", {
                status: 429,
                code: "SYNC_RATE_LIMIT",
            });
        }

        let businessId: string | undefined;
        try {
            const body = (await request.json()) as { businessId?: string };
            businessId = body.businessId;
        } catch {
            /* no body */
        }

        const { platform } = await getFacebookPlatformForUser(supabase, businessId);
        const result = await syncFacebookReviewsForPlatform(platform.id);

        return apiOk(result);
    } catch (error: unknown) {
        logger.error({ err: error }, "Facebook Sync Error:");
        const normalized = toApiError(error);
        return apiError(normalized.message || "Failed to sync reviews", {
            status: normalized.status || 500,
            code: normalized.code,
            details: normalized.details,
        });
    }
}
