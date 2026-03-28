import { syncYelpReviewsForPlatform } from "@/services/yelp/sync-service";
import { syncRateLimit } from "@/lib/auth/rate-limit";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";

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

        // 1. Get Yelp Platform ID
        const { data: memberData, error: membError } = await supabase
            .from("organization_members")
            .select(`
                organization_id,
                organizations (
                    businesses (
                        id,
                        review_platforms!inner(id, platform)
                    )
                )
            `)
            .eq("user_id", user.id)
            .single();

        if (membError || !memberData) {
            throw new ApiRouteError("Business not found", { status: 404, code: "BUSINESS_NOT_FOUND" });
        }

        const memberTyped = memberData as any;
        const business = memberTyped.organizations?.businesses?.[0];
        if (!business) throw new ApiRouteError("Business record missing", { status: 404, code: "BUSINESS_NOT_FOUND" });

        const platform = business.review_platforms?.find((p: any) => p.platform === 'yelp');
        if (!platform) {
            throw new ApiRouteError("Yelp platform not connected", {
                status: 404,
                code: "YELP_PLATFORM_NOT_CONNECTED",
            });
        }

        // 2. Call Sync Service
        console.log(`[Manual Sync] Triggered for platform ${platform.id}`);
        const result = await syncYelpReviewsForPlatform(platform.id);

        return apiOk(result);

    } catch (error: unknown) {
        console.error("Yelp Sync Error:", error);
        const normalized = toApiError(error);
        return apiError(normalized.message || "Failed to sync reviews", {
            status: normalized.status || 500,
            code: normalized.code,
            details: normalized.details,
        });
    }
}
