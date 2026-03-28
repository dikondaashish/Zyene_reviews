import { syncGoogleReviewsForPlatform } from "@/services/google/sync-service";
import { syncGooglePerformanceForPlatform } from "@/services/google/performance-sync";
import { syncGooglePhase2ForPlatform } from "@/services/google/phase2-sync";
import { syncGoogleListingProfileForPlatform } from "@/services/google/phase3-sync";
import { syncGoogleLodgingForPlatform } from "@/services/google/phase4-sync";
import { syncRateLimit } from "@/lib/auth/rate-limit";
import { redis } from "@/lib/db/redis";
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

        // 1. Get Google Platform ID
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

        interface GoogleSyncContext {
            organizations: {
                businesses: Array<{
                    id: string;
                    review_platforms: Array<{ id: string; platform: string }>;
                }>;
            } | null;
        }

        if (membError || !memberData) {
            throw new ApiRouteError("Business not found", { status: 404, code: "BUSINESS_NOT_FOUND" });
        }

        const memberTyped = memberData as unknown as GoogleSyncContext;
        const business = memberTyped.organizations?.businesses?.[0];
        if (!business) throw new ApiRouteError("Business record missing", { status: 404, code: "BUSINESS_NOT_FOUND" });

        const platform = business.review_platforms?.find((p) => p.platform === 'google');
        if (!platform) {
            throw new ApiRouteError("Google platform not connected", {
                status: 404,
                code: "GOOGLE_PLATFORM_NOT_CONNECTED",
            });
        }

        // 2. Call Sync Service
        console.log(`[Manual Sync] Triggered for platform ${platform.id}`);
        const result = await syncGoogleReviewsForPlatform(platform.id);

        // Invalidate cached business context so dashboard/integrations reflect new totals immediately.
        try {
            await redis.del(`user_businesses:${user.id}`);
        } catch (e) {
            console.error("[Manual Sync] Failed to clear business cache:", e);
        }

        syncGooglePerformanceForPlatform(platform.id).catch((e) => {
            console.error("[Manual Sync] Google Performance sync failed (non-fatal):", e);
        });
        syncGooglePhase2ForPlatform(platform.id).catch((e) => {
            console.error("[Manual Sync] Google Q&A / place actions sync failed (non-fatal):", e);
        });
        syncGoogleListingProfileForPlatform(platform.id).catch((e) => {
            console.error("[Manual Sync] Google listing / profile health sync failed (non-fatal):", e);
        });
        syncGoogleLodgingForPlatform(platform.id).catch((e) => {
            console.error("[Manual Sync] Google lodging sync failed (non-fatal):", e);
        });

        return apiOk(result);

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
