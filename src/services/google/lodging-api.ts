import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { getValidGoogleToken } from "@/services/google/sync-service";
import { getLodging, patchLodging, stripLodgingOutputOnly, type LodgingRecord } from "@/services/google/lodging";
import { mergeLodgingPatches, type LodgingPatches } from "@/services/google/lodging-merge";
import { computeLodgingHealth } from "@/services/google/lodging-health";
import { syncGoogleLodgingForPlatform } from "@/services/google/phase4-sync";
import { type NextRequest } from "next/server";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { z } from "zod";

const patchLodgingSchema = z.object({
    businessId: z.string().uuid(),
    patches: z.record(z.string(), z.unknown()),
});

export async function handleGoogleLodgingGet(request: NextRequest) {
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
            .select(
                "id, google_location_id, platform, google_lodging_synced_at, google_lodging_health_score, google_lodging_available"
            )
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

        const lodging = await getLodging(accessToken, platform.google_location_id);
        const healthScore = computeLodgingHealth(lodging);
        const publicLodging = stripLodgingOutputOnly(lodging) as LodgingRecord;

        return apiOk({
            available: true,
            lodging: publicLodging,
            healthScore,
            cached: {
                syncedAt: platform.google_lodging_synced_at,
                healthScore: platform.google_lodging_health_score,
                lodgingAvailable: platform.google_lodging_available,
            },
        });
    } catch (e: unknown) {
        const status = (e as Error & { statusCode?: number })?.statusCode;
        if (status === 404 || (e instanceof Error && /\b404\b/i.test(e.message))) {
            return apiOk({
                available: false,
                message:
                    "Google has no lodging record for this location. Lodging API applies to hotels and similar categories.",
            });
        }
        const normalized = toApiError(e);
        return apiError(normalized.message, {
            status: normalized.status || 400,
            code: normalized.code,
            details: normalized.details,
        });
    }
}

export async function handleGoogleLodgingPatch(request: Request) {
    try {
        const { supabase, user } = await requireUser();
        const parsed = patchLodgingSchema.safeParse(await request.json());
        if (!parsed.success) {
            return apiError(parsed.error.issues[0]?.message || "Invalid payload", { status: 400 });
        }

        const businessId = parsed.data.businessId;
        const patches = parsed.data.patches as LodgingPatches;

        if (!patches || typeof patches !== "object") {
            throw new ApiRouteError("businessId and patches required", {
                status: 400,
                code: "INVALID_PAYLOAD",
            });
        }

        const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
        if (!allowed) {
            throw new ApiRouteError("Forbidden", { status: 403, code: "FORBIDDEN" });
        }

        const { data: platform, error } = await supabase
            .from("review_platforms")
            .select("id, google_location_id")
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

        const current = await getLodging(accessToken, platform.google_location_id);
        const { body: merged, updateMask } = mergeLodgingPatches(current, patches);
        const updated = await patchLodging(accessToken, platform.google_location_id, merged, updateMask);
        await syncGoogleLodgingForPlatform(platform.id);

        const publicLodging = stripLodgingOutputOnly(updated) as LodgingRecord;
        return apiOk({
            success: true,
            lodging: publicLodging,
            healthScore: computeLodgingHealth(updated),
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
