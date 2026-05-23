/** Google review sync — locks */

import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import {
  STALE_LOCK_TIMEOUT_MINUTES,
  SYNC_COOLDOWN_MS,
} from "@/services/google/constants";
import { createSyncError, syncStateObject, type AdminClient } from "./helpers";

/** Read pagination cursor saved by bootstrap or a partial sync (for Inngest resume). */
export async function readGoogleReviewSyncResumeCursor(platformId: string): Promise<string | undefined> {
    const admin = createAdminClient();
    const { data } = await admin
        .from("review_platforms")
        .select("sync_state")
        .eq("id", platformId)
        .maybeSingle();
    const cursor = syncStateObject(data?.sync_state).last_page_cursor;
    if (typeof cursor === "string" && cursor.length > 0 && cursor !== "__EARLY_EXIT__") {
        return cursor;
    }
    return undefined;
}

/** Push `locked_until` forward while a long sync is still running (avoids TTL expiry mid-pagination). */
export async function extendSyncLockTtl(admin: AdminClient, platformId: string): Promise<void> {
    const until = new Date(Date.now() + STALE_LOCK_TIMEOUT_MINUTES * 60 * 1000).toISOString();
    await admin
        .from("review_platforms")
        .update({ locked_until: until, updated_at: new Date().toISOString() })
        .eq("id", platformId)
        .eq("sync_status", "running");
}

export async function acquireSyncLockOrThrow(admin: AdminClient, platformId: string) {
    // Must pass p_lock_duration so PostgREST targets acquire_platform_lock(uuid, interval) only.
    // Two DB overloads (uuid) vs (uuid, interval) cause PGRST203 if only p_id is sent.
    const { data: lockAcquired, error: lockError } = await admin.rpc("acquire_platform_lock", {
        p_id: platformId,
        p_lock_duration: `${STALE_LOCK_TIMEOUT_MINUTES} minutes`,
    });

    if (lockError || !lockAcquired) {
        if (lockError) logger.error({ err: lockError }, `[Sync] Lock RPC Error for platform ${platformId}:`);
        throw createSyncError("Sync already in progress.", "CONFLICT");
    }
}

export function enforceSyncCooldown(platform: { last_synced_at?: string | null; sync_status?: string | null }) {
    if (!platform.last_synced_at) {
        return;
    }

    const lastSync = new Date(platform.last_synced_at);
    const now = new Date();
    const diff = now.getTime() - lastSync.getTime();

    if (platform.sync_status !== "running" && diff < SYNC_COOLDOWN_MS) {
        throw createSyncError("Please wait before syncing again.", "RATE_LIMIT");
    }
}

