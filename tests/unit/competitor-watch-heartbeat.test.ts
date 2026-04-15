import { afterEach, describe, expect, it, vi } from "vitest";
import { pingCompetitorWatchHeartbeat } from "../../src/lib/monitoring/competitor-watch-heartbeat";

describe("competitor-watch-heartbeat", () => {
  const originalUrl = process.env.BETTERSTACK_COMPETITOR_WATCH_HEARTBEAT_URL;

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalUrl === undefined) {
      delete process.env.BETTERSTACK_COMPETITOR_WATCH_HEARTBEAT_URL;
    } else {
      process.env.BETTERSTACK_COMPETITOR_WATCH_HEARTBEAT_URL = originalUrl;
    }
  });

  it("does not fetch when URL is unset", async () => {
    delete process.env.BETTERSTACK_COMPETITOR_WATCH_HEARTBEAT_URL;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await pingCompetitorWatchHeartbeat(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("GETs base URL on success", async () => {
    process.env.BETTERSTACK_COMPETITOR_WATCH_HEARTBEAT_URL = "https://example.com/hb/ping";
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await pingCompetitorWatchHeartbeat(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/hb/ping",
      expect.objectContaining({ method: "GET", cache: "no-store" })
    );
  });

  it("GETs /fail path on failure", async () => {
    process.env.BETTERSTACK_COMPETITOR_WATCH_HEARTBEAT_URL = "https://example.com/hb/ping";
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await pingCompetitorWatchHeartbeat(false);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/hb/ping/fail",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("swallows fetch errors", async () => {
    process.env.BETTERSTACK_COMPETITOR_WATCH_HEARTBEAT_URL = "https://example.com/hb/ping";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    await expect(pingCompetitorWatchHeartbeat(true)).resolves.toBeUndefined();
  });
});
