import { getActiveBusinessId } from "@/lib/auth/business-context";
import { ApiRouteError } from "@/app/api/_shared/errors";
import type { SupabaseClient } from "@supabase/supabase-js";

export type GooglePlatformRow = {
    id: string;
    platform: string;
    sync_status: string | null;
    last_synced_at: string | null;
    locked_until?: string | null;
    updated_at?: string | null;
    sync_state?: unknown;
    total_reviews?: number | null;
    average_rating?: number | string | null;
};

/**
 * Match dashboard business resolution (cookie + business_members) via {@link getActiveBusinessId},
 * then load Google row with an RLS-scoped `businesses` read.
 */
export async function getGooglePlatformForUser(
    supabase: SupabaseClient,
    businessIdParam?: string | null
): Promise<{ businessId: string; platform: GooglePlatformRow }> {
    const trimmed = typeof businessIdParam === "string" ? businessIdParam.trim() : "";
    let resolvedBusinessId: string | null = trimmed.length > 0 ? trimmed : null;

    if (!resolvedBusinessId) {
        const { businessId } = await getActiveBusinessId();
        resolvedBusinessId = businessId;
    }

    if (!resolvedBusinessId) {
        throw new ApiRouteError("Business not found", { status: 404, code: "BUSINESS_NOT_FOUND" });
    }

    const { data: business, error: businessError } = await supabase
        .from("businesses")
        .select(
            `
            id,
            review_platforms (
                id,
                platform,
                sync_status,
                last_synced_at,
                locked_until,
                updated_at,
                sync_state,
                total_reviews,
                average_rating
            )
        `
        )
        .eq("id", resolvedBusinessId)
        .maybeSingle();

    if (businessError || !business) {
        throw new ApiRouteError("Business record missing", { status: 404, code: "BUSINESS_NOT_FOUND" });
    }

    const platforms = (business.review_platforms ?? []) as GooglePlatformRow[];
    const platform = platforms.find((p) => p.platform === "google");
    if (!platform) {
        throw new ApiRouteError("Google platform not connected", {
            status: 404,
            code: "GOOGLE_PLATFORM_NOT_CONNECTED",
        });
    }

    return { businessId: business.id, platform };
}
