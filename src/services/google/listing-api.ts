import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { getValidGoogleToken } from "@/services/google/sync-service";
import { getGoogleLocation } from "@/services/google/listing-information";
import { computeProfileHealth } from "@/services/google/profile-health";
import { syncGoogleListingProfileForPlatform } from "@/services/google/phase3-sync";
import { type NextRequest } from "next/server";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { logger } from "@/lib/logger";
import { publicListingPayload } from "./listing-payload";

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

        if (error || !platform?.google_location_id) {
            throw new ApiRouteError("Google not connected", { status: 404, code: "GOOGLE_NOT_CONNECTED" });
        }

        const { accessToken } = await getValidGoogleToken(platform.id);
        if (!accessToken) {
            throw new ApiRouteError("Token unavailable", { status: 401, code: "TOKEN_UNAVAILABLE" });
        }

        const loc = await getGoogleLocation(accessToken, platform.google_location_id);
        const profileHealth = computeProfileHealth(loc);

        try {
            await supabase
                .from("businesses")
                .update({
                    phone: loc.phoneNumbers?.primaryPhone || null,
                    address_line1: loc.storefrontAddress?.addressLines?.join(", ") || null,
                    city: loc.storefrontAddress?.locality || null,
                    state: loc.storefrontAddress?.administrativeArea || null,
                    zip: loc.storefrontAddress?.postalCode || null,
                    website: loc.websiteUri || null,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", businessId);
        } catch (persistErr) {
            logger.error({ err: persistErr }, "[Google Listing] Failed to persist data to businesses table:");
        }

        syncGoogleListingProfileForPlatform(platform.id).catch((err) =>
            logger.error({ err }, "[Google Listing] background profile sync failed"),
        );

        return apiOk({
            listing: publicListingPayload(loc),
            profileHealth,
            cachedScore: platform.google_profile_health_score,
            lastSyncedAt: platform.google_listing_synced_at,
        });
    } catch (e: unknown) {
        const normalized = toApiError(e);
        return apiError(normalized.message, {
            status: normalized.status || 400,
            code: normalized.code,
            details: normalized.details,
        });
    }
}
