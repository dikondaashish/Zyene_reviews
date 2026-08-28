import { getActiveBusinessId } from "@/lib/auth/business-context";
import { ApiRouteError } from "@/app/api/_shared/errors";
import type { SupabaseClient } from "@supabase/supabase-js";

export type FacebookPlatformRow = {
    id: string;
    platform: string;
    sync_status: string | null;
    last_synced_at: string | null;
};

export async function getFacebookPlatformForUser(
    supabase: SupabaseClient,
    businessIdParam?: string | null,
): Promise<{ businessId: string; platform: FacebookPlatformRow }> {
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
                last_synced_at
            )
        `,
        )
        .eq("id", resolvedBusinessId)
        .maybeSingle();

    if (businessError || !business) {
        throw new ApiRouteError("Business record missing", { status: 404, code: "BUSINESS_NOT_FOUND" });
    }

    const platforms = (business.review_platforms ?? []) as FacebookPlatformRow[];
    const platform = platforms.find((p) => p.platform === "facebook");
    if (!platform) {
        throw new ApiRouteError("Facebook platform not connected", {
            status: 404,
            code: "FACEBOOK_PLATFORM_NOT_CONNECTED",
        });
    }

    return { businessId: business.id, platform };
}
