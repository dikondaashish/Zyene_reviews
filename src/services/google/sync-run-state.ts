import type { Json } from "@/lib/db/supabase/database.types";
import { STALE_RUNNING_SYNC_MINUTES } from "./constants";

type AdminClient = ReturnType<typeof import("@/lib/db/supabase/admin").createAdminClient>;

export type GoogleSyncPlatformRef = {
    sync_status?: string | null;
    locked_until?: string | null;
    updated_at?: string | null;
    sync_state?: unknown;
};

function syncStateObject(syncState: unknown): Record<string, unknown> {
    if (syncState && typeof syncState === "object" && !Array.isArray(syncState)) {
        return syncState as Record<string, unknown>;
    }
    return {};
}

/**
 * A `running` row with no active lock worker is stale when:
 * - `locked_until` expired (worker died mid-run), or
 * - bootstrap handed off to Inngest but no worker acquired the lock in time (`locked_until` still null).
 */
export function isStaleRunningGoogleSync(
    platform: GoogleSyncPlatformRef,
    nowMs: number = Date.now()
): boolean {
    if (platform.sync_status !== "running") {
        return false;
    }

    const lockUntil = platform.locked_until ? new Date(platform.locked_until).getTime() : null;
    if (lockUntil != null && lockUntil < nowMs) {
        return true;
    }

    if (lockUntil != null) {
        return false;
    }

    const staleMs = STALE_RUNNING_SYNC_MINUTES * 60 * 1000;
    const state = syncStateObject(platform.sync_state);
    const handoffAt = state.bootstrap_handoff_at;
    if (typeof handoffAt === "string" && handoffAt.length > 0) {
        const t = new Date(handoffAt).getTime();
        if (!Number.isNaN(t) && nowMs - t > staleMs) {
            return true;
        }
    }

    const updatedAt = platform.updated_at ? new Date(platform.updated_at).getTime() : NaN;
    if (!Number.isNaN(updatedAt) && nowMs - updatedAt > staleMs) {
        return true;
    }

    return false;
}

/** Clear a zombie `running` row so a new sync or Force Sync can proceed (reviews already imported stay). */
export async function reconcileStaleGoogleSyncRun(
    admin: AdminClient,
    platformId: string,
    platform?: GoogleSyncPlatformRef | null
): Promise<boolean> {
    let row = platform;
    if (!row) {
        const { data } = await admin
            .from("review_platforms")
            .select("sync_status, locked_until, updated_at, sync_state")
            .eq("id", platformId)
            .maybeSingle();
        row = data as unknown as GoogleSyncPlatformRef | null;
    }

    if (!row || !isStaleRunningGoogleSync(row)) {
        return false;
    }

    const state = syncStateObject(row.sync_state);
    const { bootstrap_handoff_at: _removed, ...rest } = state;

    await admin
        .from("review_platforms")
        .update({
            sync_status: "idle",
            locked_until: null,
            sync_state: { ...rest, last_sync_status: "stale_running_cleared" } as Json,
            updated_at: new Date().toISOString(),
        })
        .eq("id", platformId);

    console.error(
        `[Sync] Cleared stale running sync for platform ${platformId} (no worker within ${STALE_RUNNING_SYNC_MINUTES}m).`
    );
    return true;
}

/** After bootstrap page 1: keep `running` for UI, allow Inngest to acquire lock (`locked_until` null). */
export async function markGoogleSyncBootstrapHandoff(
    admin: AdminClient,
    platformId: string
): Promise<void> {
    const { data } = await admin
        .from("review_platforms")
        .select("sync_state")
        .eq("id", platformId)
        .maybeSingle();

    const next = {
        ...syncStateObject(data?.sync_state),
        bootstrap_handoff_at: new Date().toISOString(),
        last_sync_status: "partial",
    };

    await admin
        .from("review_platforms")
        .update({
            locked_until: null,
            sync_status: "running",
            sync_state: next as Json,
            updated_at: new Date().toISOString(),
        })
        .eq("id", platformId);
}

export async function clearGoogleSyncBootstrapHandoff(
    admin: AdminClient,
    platformId: string
): Promise<void> {
    const { data } = await admin
        .from("review_platforms")
        .select("sync_state")
        .eq("id", platformId)
        .maybeSingle();

    const state = syncStateObject(data?.sync_state);
    if (!("bootstrap_handoff_at" in state)) {
        return;
    }

    const { bootstrap_handoff_at: _removed, ...rest } = state;
    await admin
        .from("review_platforms")
        .update({ sync_state: rest as Json })
        .eq("id", platformId);
}
