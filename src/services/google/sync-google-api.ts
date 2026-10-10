import { logger } from "@/lib/logger";
import { syncRateLimit } from "@/lib/auth/rate-limit";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { inngest } from "@/services/inngest/client";
import {
    clearGoogleSyncBootstrapHandoff,
    isStaleRunningGoogleSync,
    reconcileStaleGoogleSyncRun,
} from "@/services/google/sync-run-state";
import { ApiRouteError, isHandledApiClientError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { mapGoogleSyncError } from "@/lib/api/google-sync-errors";
import { getGooglePlatformForUser, type GooglePlatformRow } from "@/services/google/sync-google-platform";
import { parseGoogleSyncInput, readGoogleSyncBody } from "@/services/google/sync-google-input";

function mapSyncRouteError(error: unknown) {
    const mapped = mapGoogleSyncError(error);
    return apiError(mapped.message, {
        status: mapped.status,
        code: mapped.code,
        details: mapped.details,
    });
}

export async function handleGoogleSyncGet(request: Request) {
    try {
        const { supabase, user } = await requireUser();
        const { searchParams } = new URL(request.url);
        const { businessId } = parseGoogleSyncInput({ businessId: searchParams.get("businessId") ?? undefined });

        const { businessId: resolvedBusinessId, platform: platformRow } = await getGooglePlatformForUser(
            supabase,
            user.id,
            businessId ?? undefined
        );

        const admin = createAdminClient();
        const syncStaleBeforeReconcile = isStaleRunningGoogleSync(platformRow);
        if (syncStaleBeforeReconcile) {
            await reconcileStaleGoogleSyncRun(admin, platformRow.id, platformRow);
        }

        let platform = platformRow;
        if (syncStaleBeforeReconcile) {
            const { data: refreshed } = await admin
                .from("review_platforms")
                .select(
                    "id, platform, sync_status, last_synced_at, locked_until, updated_at, sync_state, total_reviews, average_rating"
                )
                .eq("id", platformRow.id)
                .maybeSingle();
            if (refreshed) {
                platform = refreshed as unknown as GooglePlatformRow;
            }
        }

        const { count: visibleGoogleReviewCount, error: visibleCountError } = await supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("business_id", resolvedBusinessId)
            .eq("platform", "google")
            .eq("is_visible", true);

        if (visibleCountError) {
            logger.warn(
                { err: visibleCountError },
                "[sync/google GET] visible review count failed, using review_platforms.total_reviews",
            );
        }

        const totalReviewsDisplay =
            typeof visibleGoogleReviewCount === "number" && !visibleCountError
                ? visibleGoogleReviewCount
                : Number(platform.total_reviews ?? 0);

        return apiOk({
            businessId: resolvedBusinessId,
            platformId: platform.id,
            sync_status: platform.sync_status ?? "idle",
            last_synced_at: platform.last_synced_at ?? null,
            locked_until: platform.locked_until ?? null,
            sync_stale: syncStaleBeforeReconcile || isStaleRunningGoogleSync(platform),
            total_reviews: totalReviewsDisplay,
            average_rating:
                platform.average_rating != null ? Number(platform.average_rating) : null,
        });
    } catch (error: unknown) {
        if (isHandledApiClientError(error)) {
            logger.warn({ err: error, status: error.status, code: error.code }, "Sync status GET");
        } else {
            logger.error({ err: error }, "Sync status GET");
        }
        return mapSyncRouteError(error);
    }
}

export async function handleGoogleSyncPost(request: Request) {
    try {
        const { supabase, user } = await requireUser();

        const { success: rateLimitSuccess } = await syncRateLimit.limit(user.id);
        if (!rateLimitSuccess) {
            throw new ApiRouteError("Sync rate limit exceeded. Please wait 1 minute.", {
                status: 429,
                code: "SYNC_RATE_LIMIT",
            });
        }

        const { businessId, force } = await readGoogleSyncBody(request);
        const { platform } = await getGooglePlatformForUser(supabase, user.id, businessId, true);

        const admin = createAdminClient();
        if (!force) {
            await reconcileStaleGoogleSyncRun(admin, platform.id);
        }

        if (force) {
            await admin
                .from("review_platforms")
                .update({
                    sync_status: "idle",
                    locked_until: null,
                    last_review_update_time: null,
                })
                .eq("id", platform.id);
            await clearGoogleSyncBootstrapHandoff(admin, platform.id);
        }

        await inngest.send({
            name: "google/sync.reviews",
            data: { platformId: platform.id },
        });

        return apiOk({ message: "Sync started in background" });
    } catch (error: unknown) {
        if (isHandledApiClientError(error)) {
            logger.warn({ err: error, status: error.status, code: error.code }, "Sync Error");
        } else {
            logger.error({ err: error }, "Sync Error");
        }
        return mapSyncRouteError(error);
    }
}
