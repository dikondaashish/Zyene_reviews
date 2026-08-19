import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import {
    getValidGoogleToken,
    GooglePlatformAccessError,
} from "@/services/google/sync-service";
import { getGoogleLocation } from "@/services/google/listing-information";
import { computeProfileHealth } from "@/services/google/profile-health";
import { type NextRequest } from "next/server";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { publicListingPayload } from "./listing-payload";
import { persistGoogleListingSnapshot } from "./listing-persistence";

export async function handleGoogleListingGet(request: NextRequest) {
    try {
        const { supabase, user } = await requireUser();
        const businessId = request.nextUrl.searchParams.get("businessId");
        if (!businessId) {
            throw new ApiRouteError("businessId required", { status: 400, code: "MISSING_BUSINESS_ID" });
        }

        const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
        if (!allowed) {
            throw new ApiRouteError("Forbidden", { status: 403, code: "FORBIDDEN" });
        }

        const { data: platform, error } = await supabase
            .from("review_platforms")
            .select("id, google_location_id, platform, google_profile_health_score, google_listing_synced_at")
            .eq("business_id", businessId)
            .eq("platform", "google")
            .maybeSingle();

        if (error) {
            throw new ApiRouteError("Google connection is temporarily unavailable. Please try again.", {
                status: 503,
                code: "GOOGLE_CONNECTION_UNAVAILABLE",
            });
        }
        if (!platform?.google_location_id) {
            throw new ApiRouteError("Google not connected", { status: 404, code: "GOOGLE_NOT_CONNECTED" });
        }

        const { accessToken } = await getValidGoogleToken(platform.id);
        if (!accessToken) {
            throw new ApiRouteError("Token unavailable", { status: 401, code: "TOKEN_UNAVAILABLE" });
        }

        const loc = await getGoogleLocation(accessToken, platform.google_location_id);
        const profileHealth = computeProfileHealth(loc);

        await persistGoogleListingSnapshot(supabase, {
            businessId,
            platformId: platform.id,
            location: loc,
            profileHealthScore: profileHealth.score,
        });

        return apiOk({
            listing: publicListingPayload(loc),
            profileHealth,
            cachedScore: platform.google_profile_health_score,
            lastSyncedAt: platform.google_listing_synced_at,
        });
    } catch (e: unknown) {
        const normalized = e instanceof GooglePlatformAccessError
            ? { message: e.message, status: e.status, code: e.code }
            : toApiError(e);
        return apiError(normalized.message, {
            status: normalized.status || 400,
            code: normalized.code,
            details: normalized.details,
        });
    }
}
