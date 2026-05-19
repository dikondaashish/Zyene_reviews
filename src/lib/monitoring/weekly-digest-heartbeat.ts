/**
 * Better Stack heartbeat for GET /api/cron/weekly-digest (and daily heartbeat at /api/cron/daily-digest).
 *
 * Set BETTERSTACK_WEEKLY_DIGEST_HEARTBEAT_URL to your monitor’s base URL (Uptime → Heartbeats).
 * Match Better Stack’s “expected every” to how often the cron actually runs:
 * - daily heartbeat only: GET /api/cron/daily-digest (e.g. every day)
 * - digest fan-out + heartbeat: GET /api/cron/weekly-digest (e.g. weekly)
 */
const LEGACY_HEARTBEAT_URL =
    "https://uptime.betterstack.com/api/v1/heartbeat/LPHbuasz252vU4nWUvMhUiNZ";

function heartbeatBaseUrl(): string | null {
    const raw =
        process.env.BETTERSTACK_WEEKLY_DIGEST_HEARTBEAT_URL?.trim() ||
        process.env.BETTERSTACK_DAILY_DIGEST_HEARTBEAT_URL?.trim() ||
        "";
    if (raw) return raw.replace(/\/+$/, "");
    return LEGACY_HEARTBEAT_URL;
}

/** Fire-and-forget; never throws. */
export async function pingWeeklyDigestHeartbeat(ok: boolean): Promise<void> {
    const base = heartbeatBaseUrl();
    if (!base) return;
    const url = ok ? base : `${base}/fail`;
    try {
        await fetch(url, { method: "GET", cache: "no-store" });
    } catch {
        /* monitoring must not break cron */
    }
}
