import { afterEach, expect, it, vi } from "vitest";
import { pingFollowUpHeartbeat } from "@/lib/monitoring/follow-up-heartbeat";
import { pingReviewSyncHeartbeat } from "@/lib/monitoring/review-sync-heartbeat";
import { pingWeeklyDigestHeartbeat } from "@/lib/monitoring/weekly-digest-heartbeat";

const mocks = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock("@/lib/http/fetch-with-timeout", () => ({
    fetchWithTimeout: mocks.fetch, HEARTBEAT_TIMEOUT_MS: 3000,
}));
afterEach(() => { vi.unstubAllEnvs(); vi.resetAllMocks(); });
const monitors = [
    ["BETTERSTACK_FOLLOW_UP_HEARTBEAT_URL", pingFollowUpHeartbeat],
    ["BETTERSTACK_REVIEW_SYNC_HEARTBEAT_URL", pingReviewSyncHeartbeat],
    ["BETTERSTACK_WEEKLY_DIGEST_HEARTBEAT_URL", pingWeeklyDigestHeartbeat],
] as const;
const base = "https://monitor.example/heartbeat/synthetic-only";

it.each(monitors)("%s cannot use a committed fallback when unconfigured", async (key, ping) => {
    vi.stubEnv(key, " ");
    vi.stubEnv("BETTERSTACK_DAILY_DIGEST_HEARTBEAT_URL", "");
    await ping(true);
    await ping(false);
    expect(mocks.fetch).not.toHaveBeenCalled();
});

it.each(monitors)("%s preserves configured success/failure pings", async (key, ping) => {
    vi.stubEnv(key, ` ${base}/// `);
    await ping(true);
    await ping(false);
    expect(mocks.fetch.mock.calls.map(([url]) => url)).toEqual([base, `${base}/fail`]);
    expect(mocks.fetch).toHaveBeenCalledWith(base, { method: "GET", cache: "no-store" }, 3000);
});

it.each(monitors)("%s isolates monitoring failures from jobs", async (key, ping) => {
    vi.stubEnv(key, base);
    mocks.fetch.mockRejectedValue(new Error("synthetic monitor outage"));
    await expect(ping(true)).resolves.toBeUndefined();
});

it("preserves the daily digest environment fallback without a hardcoded URL", async () => {
    vi.stubEnv("BETTERSTACK_WEEKLY_DIGEST_HEARTBEAT_URL", "");
    vi.stubEnv("BETTERSTACK_DAILY_DIGEST_HEARTBEAT_URL", base);
    await pingWeeklyDigestHeartbeat(true);
    expect(mocks.fetch).toHaveBeenCalledWith(base, { method: "GET", cache: "no-store" }, 3000);
});
