import { syncRateLimit } from "@/lib/auth/rate-limit";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { inngest } from "@/services/inngest/client";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { mapGoogleSyncError } from "@/lib/api/google-sync-errors";
import type { SupabaseClient } from "@supabase/supabase-js";

type GooglePlatformRow = {
    id: string;
    platform: string;
    sync_status: string | null;
    last_synced_at: string | null;
    locked_until?: string | null;
    total_reviews?: number | null;
    average_rating?: number | string | null;
};

/**
 * Match dashboard business resolution (cookie + business_members) via {@link getActiveBusinessId},
 * then load Google row with an RLS-scoped `businesses` read. Avoids organization_members + nested
 * `!inner` + `.single()` which fails for multi-org users and business-scoped memberships.
 */
async function getGooglePlatformForUser(
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

export async function GET(request: Request) {
    try {
        const { supabase, user } = await requireUser();
        const { searchParams } = new URL(request.url);
        const businessId = searchParams.get("businessId") ?? undefined;

        const { businessId: resolvedBusinessId, platform } = await getGooglePlatformForUser(
            supabase,
            businessId ?? undefined
        );

        return apiOk({
            businessId: resolvedBusinessId,
            platformId: platform.id,
            sync_status: platform.sync_status ?? "idle",
            last_synced_at: platform.last_synced_at ?? null,
            locked_until: platform.locked_until ?? null,
            total_reviews: Number(platform.total_reviews ?? 0),
            average_rating:
                platform.average_rating != null ? Number(platform.average_rating) : null,
        });
    } catch (error: unknown) {
        console.error("Sync status GET:", error);
        const mapped = mapGoogleSyncError(error);
        const normalized = toApiError(error);
        return apiError(mapped.message || normalized.message, {
            status: mapped.status ?? normalized.status,
            code: mapped.code ?? normalized.code,
            details: mapped.details ?? normalized.details,
        });
    }
}

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

        let businessId: string | undefined;
        let force = false;
        try {
            const body = await request.json();
            businessId = body.businessId;
            force = !!body.force;
        } catch {
            /* no body */
        }

        const { platform } = await getGooglePlatformForUser(supabase, businessId);
        
        if (force) {
            console.log(`[Manual Sync] Force reset requested for platform ${platform.id}`);
            await supabase
                .from("review_platforms")
                .update({
                    sync_status: "idle",
                    locked_until: null,
                    /** Next sync walks full pagination (no incremental early-stop). */
                    last_review_update_time: null,
                })
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
