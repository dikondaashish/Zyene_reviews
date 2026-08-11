import { fetchWithTimeout, HEARTBEAT_TIMEOUT_MS } from "@/lib/http/fetch-with-timeout";
/**
 * Better Stack heartbeat for Competitor Watch cron.
 * Set BETTERSTACK_COMPETITOR_WATCH_HEARTBEAT_URL in Vercel env.
 */
function heartbeatBaseUrl(): string | null {
    const base = process.env.BETTERSTACK_COMPETITOR_WATCH_HEARTBEAT_URL?.trim();
    if (!base) return null;
    return base.replace(/\/$/, "");
}

/** Fire-and-forget; never throws. */
export async function pingCompetitorWatchHeartbeat(ok: boolean): Promise<void> {
    const base = heartbeatBaseUrl();
    if (!base) return;
    const url = ok ? base : `${base}/fail`;
    try {
        await fetchWithTimeout(url, { method: "GET", cache: "no-store" }, HEARTBEAT_TIMEOUT_MS);
    } catch {
        // Monitoring failures should never break cron execution.
    }
}
