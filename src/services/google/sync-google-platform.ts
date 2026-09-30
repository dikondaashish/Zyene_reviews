import { getActiveBusinessId } from "@/lib/auth/business-context";
import { ApiRouteError } from "@/app/api/_shared/errors";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { logger } from "@/lib/logger";
import type { Database } from "@/lib/db/supabase/database.types";
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
 * Resolve the dashboard business, verify live access using the user's RLS client,
 * then read backend-only sync fields. Never grant these fields to browser clients.
 */
export async function getGooglePlatformForUser(
    supabase: SupabaseClient<Database>,
    userId: string,
    businessIdParam?: string | null,
    write = false,
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

    if (!(await userCanAccessBusiness(supabase, userId, resolvedBusinessId, write))) {
        throw new ApiRouteError("Business not found or access denied", { status: 404, code: "BUSINESS_NOT_FOUND" });
    }

    const { data: platform, error } = await createAdminClient()
        .from("review_platforms")
        .select("id, platform, sync_status, last_synced_at, locked_until, updated_at, sync_state, total_reviews, average_rating")
        .eq("business_id", resolvedBusinessId)
        .eq("platform", "google")
        .maybeSingle();

    if (error) {
        logger.error({ err: error, businessId: resolvedBusinessId }, "Google sync platform lookup failed");
        throw new ApiRouteError("Unable to load Google sync status. Please try again.", {
            status: 500, code: "GOOGLE_PLATFORM_LOOKUP_FAILED",
        });
    }
    if (!platform) {
        throw new ApiRouteError("Google platform not connected", {
            status: 404,
            code: "GOOGLE_PLATFORM_NOT_CONNECTED",
        });
    }

    return { businessId: resolvedBusinessId, platform };
}
