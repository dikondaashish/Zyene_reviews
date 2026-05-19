import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { pingWeeklyDigestHeartbeat } from "../../src/lib/monitoring/weekly-digest-heartbeat";

describe("weekly-digest-heartbeat", () => {
  const originalWeekly = process.env.BETTERSTACK_WEEKLY_DIGEST_HEARTBEAT_URL;
  const originalDaily = process.env.BETTERSTACK_DAILY_DIGEST_HEARTBEAT_URL;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalWeekly === undefined) {
      delete process.env.BETTERSTACK_WEEKLY_DIGEST_HEARTBEAT_URL;
    } else {
      process.env.BETTERSTACK_WEEKLY_DIGEST_HEARTBEAT_URL = originalWeekly;
    }
    if (originalDaily === undefined) {
      delete process.env.BETTERSTACK_DAILY_DIGEST_HEARTBEAT_URL;
    } else {
      process.env.BETTERSTACK_DAILY_DIGEST_HEARTBEAT_URL = originalDaily;
    }
  });

  it("uses legacy URL when env is unset", async () => {
    delete process.env.BETTERSTACK_WEEKLY_DIGEST_HEARTBEAT_URL;
    delete process.env.BETTERSTACK_DAILY_DIGEST_HEARTBEAT_URL;

    await pingWeeklyDigestHeartbeat(true);

    expect(fetch).toHaveBeenCalledWith(
      "https://uptime.betterstack.com/api/v1/heartbeat/LPHbuasz252vU4nWUvMhUiNZ",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("prefers BETTERSTACK_WEEKLY_DIGEST_HEARTBEAT_URL when set", async () => {
    process.env.BETTERSTACK_WEEKLY_DIGEST_HEARTBEAT_URL = "https://example.com/hb/ping/";

    await pingWeeklyDigestHeartbeat(true);

    expect(fetch).toHaveBeenCalledWith("https://example.com/hb/ping", expect.any(Object));
  });

  it("pings /fail on failure", async () => {
    process.env.BETTERSTACK_WEEKLY_DIGEST_HEARTBEAT_URL = "https://example.com/hb/ping";

    await pingWeeklyDigestHeartbeat(false);

    expect(fetch).toHaveBeenCalledWith("https://example.com/hb/ping/fail", expect.any(Object));
  });
});
