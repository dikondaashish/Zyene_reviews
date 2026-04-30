/**
 * Better Stack heartbeat for GET /api/cron/follow-up.
 *
 * Set BETTERSTACK_FOLLOW_UP_HEARTBEAT_URL to your monitor’s base URL (Uptime → Heartbeats).
 * Match Better Stack’s “expected every” to how often this route is actually invoked (often daily).
 *
 * The cron must ping success even when there are zero follow-up campaigns; otherwise the monitor
 * looks “down” on every quiet day.
 */
const LEGACY_HEARTBEAT_URL =
    "https://uptime.betterstack.com/api/v1/heartbeat/qaTkuG86YMyWVZNXgeBDtGWc";

function heartbeatBaseUrl(): string | null {
    const fromEnv = process.env.BETTERSTACK_FOLLOW_UP_HEARTBEAT_URL?.trim();
    if (fromEnv) return fromEnv.replace(/\/+$/, "");
    return LEGACY_HEARTBEAT_URL;
}

/** Fire-and-forget; never throws. */
export async function pingFollowUpHeartbeat(ok: boolean): Promise<void> {
    const base = heartbeatBaseUrl();
    if (!base) return;
    const url = ok ? base : `${base}/fail`;
    try {
        await fetch(url, { method: "GET", cache: "no-store" });
    } catch {
        /* monitoring must not break cron */
    }
}
