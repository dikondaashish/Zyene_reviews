import { afterEach, describe, expect, it, vi } from "vitest";
import { pingFollowUpHeartbeat } from "../../src/lib/monitoring/follow-up-heartbeat";

describe("follow-up-heartbeat", () => {
  const originalUrl = process.env.BETTERSTACK_FOLLOW_UP_HEARTBEAT_URL;

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalUrl === undefined) {
      delete process.env.BETTERSTACK_FOLLOW_UP_HEARTBEAT_URL;
    } else {
      process.env.BETTERSTACK_FOLLOW_UP_HEARTBEAT_URL = originalUrl;
    }
  });

  it("GETs legacy URL on success when env is unset", async () => {
    delete process.env.BETTERSTACK_FOLLOW_UP_HEARTBEAT_URL;
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await pingFollowUpHeartbeat(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain("qaTkuG86YMyWVZNXgeBDtGWc");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("heartbeat"),
      expect.objectContaining({ method: "GET", cache: "no-store" })
    );
  });

  it("GETs base URL on success when env is set", async () => {
    process.env.BETTERSTACK_FOLLOW_UP_HEARTBEAT_URL = "https://example.com/hb/ping";
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await pingFollowUpHeartbeat(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/hb/ping",
      expect.objectContaining({ method: "GET", cache: "no-store" })
    );
  });

  it("GETs /fail path on failure", async () => {
    process.env.BETTERSTACK_FOLLOW_UP_HEARTBEAT_URL = "https://example.com/hb/ping";
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await pingFollowUpHeartbeat(false);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/hb/ping/fail",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("swallows fetch errors", async () => {
    process.env.BETTERSTACK_FOLLOW_UP_HEARTBEAT_URL = "https://example.com/hb/ping";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    await expect(pingFollowUpHeartbeat(true)).resolves.toBeUndefined();
  });
});
