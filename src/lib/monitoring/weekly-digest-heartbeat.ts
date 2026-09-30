import { fetchWithTimeout, HEARTBEAT_TIMEOUT_MS } from "@/lib/http/fetch-with-timeout";

/** Configure the monitor's bearer URL through server-only environment settings. */
function heartbeatBaseUrl(): string | null {
    const base = process.env.BETTERSTACK_WEEKLY_DIGEST_HEARTBEAT_URL?.trim()
        || process.env.BETTERSTACK_DAILY_DIGEST_HEARTBEAT_URL?.trim();
    return base ? base.replace(/\/+$/, "") : null;
}

/** Fire-and-forget; never throws. Shared by weekly fan-out and daily liveness. */
export async function pingWeeklyDigestHeartbeat(ok: boolean): Promise<void> {
    const base = heartbeatBaseUrl();
    if (!base) return;
    try {
        await fetchWithTimeout(ok ? base : `${base}/fail`,
            { method: "GET", cache: "no-store" }, HEARTBEAT_TIMEOUT_MS);
    } catch {
        // Monitoring failures must not break digest execution.
    }
}
