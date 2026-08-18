import { createAdminClient } from "@/lib/db/supabase/admin";
import { getGoogleLocation } from "@/services/google/listing-information";
import { getValidGoogleToken } from "@/services/google/sync-service";

export type GoogleGridIdentity =
    | { ok: true; lat: number; lng: number; placeId: string }
    | { ok: false; error: string };

export async function resolveGoogleGridIdentity(businessId: string): Promise<GoogleGridIdentity> {
    const { data: platform } = await createAdminClient()
        .from("review_platforms")
        .select("id, google_location_id")
        .eq("business_id", businessId)
        .eq("platform", "google")
        .maybeSingle();
    if (!platform?.id || !platform.google_location_id) {
        return { ok: false, error: "Connect Google Business Profile before running a geo-grid." };
    }

    try {
        const { accessToken } = await getValidGoogleToken(platform.id);
        if (!accessToken) throw new Error("No Google access token");
        const location = await getGoogleLocation(accessToken, platform.google_location_id);
        const lat = location.latlng?.latitude;
        const lng = location.latlng?.longitude;
        const placeId = location.metadata?.placeId?.trim();
        if (typeof lat === "number" && typeof lng === "number" && placeId) {
            return { ok: true, lat, lng, placeId };
        }
    } catch {
        // The refusal below is safer than centering or matching on a guess.
    }
    return {
        ok: false,
        error: "Google has not supplied both a coordinate and Place ID for this verified listing.",
    };
}
