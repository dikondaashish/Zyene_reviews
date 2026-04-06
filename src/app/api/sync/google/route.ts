import { syncGoogleReviewsForPlatform } from "@/services/google/sync-service";
import { syncGooglePerformanceForPlatform } from "@/services/google/performance-sync";
import { syncGooglePhase2ForPlatform } from "@/services/google/phase2-sync";
import { syncGoogleListingProfileForPlatform } from "@/services/google/phase3-sync";
import { syncGoogleLodgingForPlatform } from "@/services/google/phase4-sync";
import { syncRateLimit } from "@/lib/auth/rate-limit";
import { redis } from "@/lib/db/redis";
import { inngest } from "@/services/inngest/client";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { mapGoogleSyncError } from "@/lib/api/google-sync-errors";

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

        // 1. Resolve Target Business & Platform
        let businessId: string | undefined;
        let force = false;
        try {
            const body = await request.json();
            businessId = body.businessId;
            force = !!body.force;
        } catch {
            /* no body */
        }

        let query = supabase
            .from("organization_members")
            .select(`
                organizations (
                    businesses (
                        id,
                        review_platforms!inner(id, platform)
                    )
                )
            `)
            .eq("user_id", user.id);

        if (businessId) {
            query = query.eq("organizations.businesses.id", businessId);
        }

        const { data: memberData, error: membError } = await query.single();

        if (membError || !memberData) {
            throw new ApiRouteError("Business not found", { status: 404, code: "BUSINESS_NOT_FOUND" });
        }

        const memberTyped = memberData as any;
        const businesses = memberTyped.organizations?.businesses || [];
        
        // Match the specific businessId if provided, else take first.
        const business = businessId 
            ? businesses.find((b: any) => b.id === businessId)
            : businesses[0];

        if (!business) throw new ApiRouteError("Business record missing", { status: 404, code: "BUSINESS_NOT_FOUND" });

        const platform = business.review_platforms?.find((p: any) => p.platform === 'google');
        if (!platform) {
            throw new ApiRouteError("Google platform not connected", {
                status: 404,
                code: "GOOGLE_PLATFORM_NOT_CONNECTED",
            });
        }
        
        if (force) {
            console.log(`[Manual Sync] Force reset requested for platform ${platform.id}`);
            await supabase
                .from("review_platforms")
                .update({ sync_status: 'idle', locked_until: null })
                .eq("id", platform.id);
        }

        // 2. Trigger Background Sync
        console.log(`[Manual Sync] Triggering background job for platform ${platform.id}`);
        await inngest.send({
            name: "google/sync.reviews",
            data: { platformId: platform.id }
        });

        return apiOk({ message: "Sync started in background" });

    } catch (error: unknown) {
        console.error("Sync Error:", error);
        const mapped = mapGoogleSyncError(error);
        const normalized = toApiError(error);
        return apiError(mapped.message || normalized.message, {
            status: mapped.status ?? normalized.status,
            code: mapped.code ?? normalized.code,
            details: mapped.details ?? normalized.details,
        });
    }
}
