import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { pingWeeklyDigestHeartbeat } from "@/lib/monitoring/weekly-digest-heartbeat";

beforeEach(() => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true })); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe("weekly-digest-heartbeat", () => {
    it("does not ping an embedded URL when env is unset", async () => {
        vi.stubEnv("BETTERSTACK_WEEKLY_DIGEST_HEARTBEAT_URL", "");
        vi.stubEnv("BETTERSTACK_DAILY_DIGEST_HEARTBEAT_URL", "");
        await pingWeeklyDigestHeartbeat(true);
        expect(fetch).not.toHaveBeenCalled();
    });

    it("prefers the configured weekly URL", async () => {
        vi.stubEnv("BETTERSTACK_WEEKLY_DIGEST_HEARTBEAT_URL", "https://example.com/hb/ping/");
        vi.stubEnv("BETTERSTACK_DAILY_DIGEST_HEARTBEAT_URL", "https://example.com/daily");
        await pingWeeklyDigestHeartbeat(true);
        expect(fetch).toHaveBeenCalledWith("https://example.com/hb/ping", expect.any(Object));
    });

    it("pings /fail on failure", async () => {
        vi.stubEnv("BETTERSTACK_WEEKLY_DIGEST_HEARTBEAT_URL", "https://example.com/hb/ping");
        await pingWeeklyDigestHeartbeat(false);
        expect(fetch).toHaveBeenCalledWith("https://example.com/hb/ping/fail", expect.any(Object));
    });
});
