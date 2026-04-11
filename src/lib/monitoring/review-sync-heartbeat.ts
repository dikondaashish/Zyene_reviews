/**
 * Better Stack (or compatible) heartbeat for the review sync pipeline.
 *
 * Set BETTERSTACK_REVIEW_SYNC_HEARTBEAT_URL in production to the exact URL shown
 * in Uptime → Heartbeats for this monitor. If unset, falls back to the legacy
 * URL baked into the cron route (update env if you recreated the monitor).
 *
 * Note: Your monitor's "expected every" interval should be <= how often this
 * runs in practice (or you will get false "missed heartbeat" incidents).
 */
const LEGACY_HEARTBEAT_URL =
    "https://uptime.betterstack.com/api/v1/heartbeat/6VwMgkdn2vqaoo3NG2wwfeNV";

function heartbeatBaseUrl(): string | null {
    const fromEnv = process.env.BETTERSTACK_REVIEW_SYNC_HEARTBEAT_URL?.trim();
    if (fromEnv) return fromEnv.replace(/\/$/, "");
    return LEGACY_HEARTBEAT_URL;
}

/** Fire-and-forget; never throws. */
export async function pingReviewSyncHeartbeat(ok: boolean): Promise<void> {
    const base = heartbeatBaseUrl();
    if (!base) return;
    const url = ok ? base : `${base}/fail`;
    try {
        await fetch(url, { method: "GET", cache: "no-store" });
    } catch {
        /* monitoring must not break sync */
    }
}
