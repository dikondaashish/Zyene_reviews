import { logger } from "@/lib/logger";
import { syncRateLimit } from "@/lib/auth/rate-limit";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { syncFacebookReviewsForPlatform } from "@/services/facebook/sync-service";
import { getFacebookPlatformForUser } from "@/services/facebook/sync-facebook-platform";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";
import { z } from "zod";

const syncBodySchema = z.object({ businessId: z.string().uuid().optional() });

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

        const parsed = syncBodySchema.safeParse(await request.json().catch(() => ({})));
        if (!parsed.success) {
            throw new ApiRouteError("Invalid businessId", { status: 400, code: "INVALID_BUSINESS_ID" });
        }

        const { businessId, platform } = await getFacebookPlatformForUser(supabase, parsed.data.businessId);
        // Same gate as Yelp and Google: a manual sync is a managed action, not a viewer one.
        if (!(await canManageBusinessIntegration(supabase, user.id, businessId))) {
            throw new ApiRouteError("Business not found", { status: 404, code: "BUSINESS_NOT_FOUND" });
        }
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
