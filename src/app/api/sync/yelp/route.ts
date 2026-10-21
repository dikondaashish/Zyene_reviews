import { z } from "zod";
import { logger } from "@/lib/logger";
import { syncYelpReviewsForPlatform } from "@/services/yelp/sync-service";
import { syncRateLimit } from "@/lib/auth/rate-limit";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";
import { ApiRouteError, isHandledApiClientError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";

const syncBodySchema = z.object({ businessId: z.string().uuid().optional() });

export async function POST(request: Request) {
    try {
        const { supabase, user } = await requireUser();

        // Apply Rate Limiting (1 sync per 5 mins per user)
        const { success: rateLimitSuccess } = await syncRateLimit.limit(user.id);
        if (!rateLimitSuccess) {
            throw new ApiRouteError("Sync rate limit exceeded. Please wait 1 minute.", {
                status: 429,
                code: "SYNC_RATE_LIMIT",
            });
        }

        // 1. Resolve the business: explicit body value, else the business selected in the header
        const parsed = syncBodySchema.safeParse(await request.json().catch(() => ({})));
        if (!parsed.success) {
            throw new ApiRouteError("Invalid businessId", { status: 400, code: "INVALID_BUSINESS_ID" });
        }
        const businessId = parsed.data.businessId ?? (await getActiveBusinessId()).businessId;
        if (!businessId || !(await canManageBusinessIntegration(supabase, user.id, businessId))) {
            throw new ApiRouteError("Business not found", { status: 404, code: "BUSINESS_NOT_FOUND" });
        }

        // 2. Get Yelp Platform ID
        const { data: platform } = await supabase
            .from("review_platforms")
            .select("id")
            .eq("business_id", businessId)
            .eq("platform", "yelp")
            .maybeSingle();
        if (!platform) {
            throw new ApiRouteError("Yelp platform not connected", {
                status: 404,
                code: "YELP_PLATFORM_NOT_CONNECTED",
            });
        }

        // 3. Call Sync Service
        const result = await syncYelpReviewsForPlatform(platform.id);

        return apiOk(result);

    } catch (error: unknown) {
        if (isHandledApiClientError(error)) {
            logger.warn({ err: error, status: error.status, code: error.code }, "Yelp Sync Error:");
        } else {
            logger.error({ err: error }, "Yelp Sync Error:");
        }
        const normalized = toApiError(error);
        return apiError(normalized.message || "Failed to sync reviews", {
            status: normalized.status || 500,
            code: normalized.code,
            details: normalized.details,
        });
    }
}
