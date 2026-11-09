/** Another sync holds the platform lock - safe to skip duplicate cron/Inngest work. */
export function isGoogleSyncConflictError(error: unknown): boolean {
    const e = error as { code?: string; message?: string };
    return e?.code === "CONFLICT" || String(e?.message || "").includes("Sync already in progress");
}

/** A sync finished moments ago (cooldown window) - reviews are already fresh, nothing to do. */
export function isGoogleSyncCooldownError(error: unknown): boolean {
    const e = error as { code?: string; message?: string };
    return e?.code === "RATE_LIMIT" && String(e?.message || "").includes("Please wait before syncing again");
}

/**
 * A lock a worker is still renewing: `running` with `locked_until` ahead of now.
 * A stuck lock (worker died) lets `locked_until` lapse, which is what Force Sync is for.
 */
export function isLiveSyncLock(
    lock: { sync_status?: string | null; locked_until?: string | null } | null | undefined,
    now: number = Date.now(),
): boolean {
    if (lock?.sync_status !== "running" || !lock.locked_until) return false;
    const until = Date.parse(lock.locked_until);
    return Number.isFinite(until) && until > now;
}
