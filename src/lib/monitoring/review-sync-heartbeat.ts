import { fetchWithTimeout, HEARTBEAT_TIMEOUT_MS } from "@/lib/http/fetch-with-timeout";

/** Configure the monitor's bearer URL through server-only environment settings. */
function heartbeatBaseUrl(): string | null {
    const base = process.env.BETTERSTACK_REVIEW_SYNC_HEARTBEAT_URL?.trim();
    return base ? base.replace(/\/+$/, "") : null;
}

/** Fire-and-forget; never throws. */
export async function pingReviewSyncHeartbeat(ok: boolean): Promise<void> {
    const base = heartbeatBaseUrl();
    if (!base) return;
    try {
        await fetchWithTimeout(ok ? base : `${base}/fail`,
            { method: "GET", cache: "no-store" }, HEARTBEAT_TIMEOUT_MS);
    } catch {
        // Monitoring failures must not break review synchronization.
    }
}
