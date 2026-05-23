import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { getValidGoogleToken } from "@/services/google/sync-service";
import { getGoogleLocation, patchGoogleLocation } from "@/services/google/listing-information";
import { computeProfileHealth } from "@/services/google/profile-health";
import { syncGoogleListingProfileForPlatform } from "@/services/google/phase3-sync";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { createRequestLogger } from "@/lib/logger";
import { patchListingSchema } from "./listing-schema";
import { publicListingPayload } from "./listing-payload";
import { buildPatchListingInput } from "./listing-patch-input";

export async function handleGoogleListingPatch(request: Request) {
    try {
        const { requestId } = createRequestLogger("PATCH /api/google/listing");
        const { supabase, user } = await requireUser();
        const parsed = patchListingSchema.safeParse(await request.json());
        if (!parsed.success) {
            return apiError(parsed.error.issues[0]?.message || "Invalid payload", { status: 400, details: requestId });
        }

        const { businessId } = parsed.data;

        const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
        if (!allowed) {
            throw new ApiRouteError("Forbidden", { status: 403, code: "FORBIDDEN" });
        }

        const { data: platform, error } = await supabase
            .from("review_platforms")
            .select("id, google_location_id, platform")
            .eq("business_id", businessId)
            .eq("platform", "google")
            .maybeSingle();

        if (error || !platform?.google_location_id) {
            throw new ApiRouteError("Google not connected", { status: 404, code: "GOOGLE_NOT_CONNECTED" });
        }

        const input = buildPatchListingInput(parsed.data);
        if (Object.keys(input).length === 0) {
            throw new ApiRouteError("No valid fields to update (empty values are ignored)", {
                status: 400,
                code: "NO_VALID_FIELDS",
            });
        }

        const { accessToken } = await getValidGoogleToken(platform.id);
        if (!accessToken) {
            throw new ApiRouteError("Token unavailable", { status: 401, code: "TOKEN_UNAVAILABLE" });
        }

        await patchGoogleLocation(accessToken, platform.google_location_id, input);
        await syncGoogleListingProfileForPlatform(platform.id);

        const { accessToken: token2 } = await getValidGoogleToken(platform.id);
        if (!token2) {
            return apiOk({ success: true });
        }
        const loc = await getGoogleLocation(token2, platform.google_location_id);
        const profileHealth = computeProfileHealth(loc);

        return apiOk({
            success: true,
            listing: publicListingPayload(loc),
            profileHealth,
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
