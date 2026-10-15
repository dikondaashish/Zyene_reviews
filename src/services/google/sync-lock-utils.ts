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
