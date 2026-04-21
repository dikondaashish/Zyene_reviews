import { syncRateLimit } from "@/lib/auth/rate-limit";
import { inngest } from "@/services/inngest/client";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { mapGoogleSyncError } from "@/lib/api/google-sync-errors";
import type { SupabaseClient } from "@supabase/supabase-js";

async function getGooglePlatformForUser(
    supabase: SupabaseClient,
    userId: string,
    businessId?: string
): Promise<{
    businessId: string;
    platform: { id: string; sync_status: string | null; last_synced_at: string | null };
}> {
    let query = supabase
        .from("organization_members")
        .select(`
            organizations (
                businesses (
                    id,
                    review_platforms!inner(id, platform, sync_status, last_synced_at)
                )
            )
        `)
        .eq("user_id", userId);

    if (businessId) {
        query = query.eq("organizations.businesses.id", businessId);
    }

    const { data: memberData, error: membError } = await query.single();

    if (membError || !memberData) {
        throw new ApiRouteError("Business not found", { status: 404, code: "BUSINESS_NOT_FOUND" });
    }

    const memberTyped = memberData as {
        organizations?: { businesses?: Array<{ id: string; review_platforms?: unknown[] }> };
    };
    const businesses = memberTyped.organizations?.businesses || [];
    const business = businessId ? businesses.find((b) => b.id === businessId) : businesses[0];

    if (!business) throw new ApiRouteError("Business record missing", { status: 404, code: "BUSINESS_NOT_FOUND" });

    const platform = (business.review_platforms as Array<{ id: string; platform: string; sync_status: string | null; last_synced_at: string | null }> | undefined)?.find(
        (p) => p.platform === "google"
    );
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
            user.id,
            businessId ?? undefined
        );

        return apiOk({
            businessId: resolvedBusinessId,
            platformId: platform.id,
            sync_status: platform.sync_status ?? "idle",
            last_synced_at: platform.last_synced_at ?? null,
            locked_until: (platform as any).locked_until ?? null,
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

        const { platform } = await getGooglePlatformForUser(supabase, user.id, businessId);
        
        if (force) {
            console.log(`[Manual Sync] Force reset requested for platform ${platform.id}`);
            await supabase
                .from("review_platforms")
                .update({ sync_status: 'idle', locked_until: null })
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
