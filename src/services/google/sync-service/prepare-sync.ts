/** Google review sync — prepare-sync */

import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import {
  listAccounts,
  listLocations,
  isGoogleUnauthorizedError,
} from "@/services/google/business-profile";
import { registerNotificationsWithRetry } from "@/services/google/notifications";
import { SyncStateManager } from "@/services/google/sync-state-manager";
import type { GooglePlatformWithTokens } from "@/types/google-sync";
import {
  clearGoogleSyncBootstrapHandoff,
  reconcileStaleGoogleSyncRun,
} from "@/services/google/sync-run-state";
import { acquireSyncLockOrThrow, enforceSyncCooldown } from "./locks";
import { forceRefreshGoogleAccessToken, getValidGoogleToken } from "./tokens";
import type { GoogleSyncContext } from "./types";

/**
 * Step 1: Pre-sync check and acquire lock.
 */
export async function prepareGoogleSync(platformId: string): Promise<GoogleSyncContext> {
    const admin = createAdminClient();

    // 1. Fetch Platform
    const { data: platform, error: platformError } = await admin
        .from("review_platforms")
        .select("*")
        .eq("id", platformId)
        .single();

    if (platformError || !platform) {
        const msg = platformError?.message ? `, error=${platformError.message}` : "";
        throw new Error(`Platform not found: id=${platformId}${msg}`);
    }

    await reconcileStaleGoogleSyncRun(admin, platformId, platform);

    const { data: platformAfterReconcile } = await admin
        .from("review_platforms")
        .select("*")
        .eq("id", platformId)
        .single();

    const activePlatform = platformAfterReconcile ?? platform;

    // 2. Cooldown
    enforceSyncCooldown(activePlatform);

    // 3. Acquire Lock
    await acquireSyncLockOrThrow(admin, platformId);
    await clearGoogleSyncBootstrapHandoff(admin, platformId);

    try {
        // 4. Token & IDs
        let { accessToken, platform: validPlatform } = await getValidGoogleToken(platformId);

        let googleAccountId = validPlatform.google_account_id;
        let googleLocationId = validPlatform.google_location_id;

        if (!googleLocationId && validPlatform.external_id) {
            googleLocationId = String(validPlatform.external_id);
        }

        const resolveGoogleIdsFromApi = async (token: string) => {
            const accounts = await listAccounts(token);
            if (accounts.length === 0) throw new Error("No Google Accounts found");
            const account = accounts[0];
            const resolvedAccountId = account.name.split("/")[1];

            const locations = await listLocations(token, account.name);
            let locationDetails = null;
            if (validPlatform.external_id) {
                locationDetails = locations.find((l) =>
                    l.name.endsWith(`/${validPlatform.external_id}`)
                );
            }
            if (!locationDetails) {
                if (locations.length === 0) throw new Error("No Locations found");
                locationDetails = locations[0];
            }
            const resolvedLocationId = locationDetails.name.split("/").pop() ?? null;

            googleAccountId = resolvedAccountId;
            googleLocationId = resolvedLocationId;

            await admin
                .from("review_platforms")
                .update({
                    google_account_id: googleAccountId,
                    google_location_id: googleLocationId,
                    external_id: googleLocationId,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", platformId);
        };

        if (!googleAccountId || !googleLocationId) {
            try {
                await resolveGoogleIdsFromApi(accessToken!);
            } catch (err) {
                if (!isGoogleUnauthorizedError(err)) {
                    throw err;
                }
                logger.error("[Sync] listAccounts 401 — forcing token refresh and retrying");
                const refreshed = await forceRefreshGoogleAccessToken(platformId);
                accessToken = refreshed.accessToken;
                validPlatform = refreshed.platform;
                await resolveGoogleIdsFromApi(accessToken);
            }
        }

        // 5. Auto-register for real-time notifications if topic is configured (non-fatal for sync).
        const topicName = process.env.GOOGLE_PUBSUB_TOPIC_NAME;
        if (topicName && googleAccountId) {
            const accountName = `accounts/${googleAccountId}`;
            await registerNotificationsWithRetry({
                accessToken: accessToken!,
                accountName,
                topic: topicName,
                platformId,
                googleAccountId,
                logPrefix: "[Sync]",
            });
        }

        return {
            platform: validPlatform,
            accessToken: accessToken!,
            googleAccountId: googleAccountId!,
            googleLocationId: googleLocationId!,
            lastReviewUpdateTime: (validPlatform as GooglePlatformWithTokens & { last_review_update_time?: string | null })?.last_review_update_time ?? null,
            syncStateManager: new SyncStateManager(),
            reviewsProcessed: 0,
            highestReviewUpdateTime: (validPlatform as GooglePlatformWithTokens & { last_review_update_time?: string | null })?.last_review_update_time ?? null,
            orderByUpdateTimeEnabled: true,
        };
    } catch (err) {
        // Cleanup lock if setup fails
        await admin.from("review_platforms").update({ sync_status: 'idle', locked_until: null }).eq("id", platformId);
        throw err;
    }
}

