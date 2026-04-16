/** Another sync holds the platform lock — safe to skip duplicate cron/Inngest work. */
export function isGoogleSyncConflictError(error: unknown): boolean {
    const e = error as { code?: string; message?: string };
    return e?.code === "CONFLICT" || String(e?.message || "").includes("Sync already in progress");
}
