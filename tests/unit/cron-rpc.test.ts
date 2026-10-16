import { afterEach, describe, expect, it, vi } from "vitest";

import {
  callCronRpc,
  isTransientRpcFailure,
  summarizeRpcError,
} from "../../src/lib/cron/cron-rpc";

const cloudflareDnsPage = `<!doctype html>
<html class="no-js" lang="en-US">
  <head><title>DNS resolution error | example.supabase.co | Cloudflare</title></head>
  <body>Error 1001</body>
</html>`;

afterEach(() => {
  vi.useRealTimers();
});

describe("isTransientRpcFailure", () => {
  it.each([
    { data: null, error: { message: cloudflareDnsPage } },
    { data: null, error: { message: "TypeError: fetch failed" } },
    { data: null, error: { message: "getaddrinfo EAI_AGAIN host" } },
    { data: null, error: { message: "Bad gateway" }, status: 502 },
  ])("treats network and gateway failures as transient", (result) => {
    expect(isTransientRpcFailure(result)).toBe(true);
  });

  it.each([
    { data: null, error: null },
    { data: null, error: { message: "invalid input syntax for type uuid" }, status: 400 },
    { data: null, error: { message: "function claim_cron_job_run does not exist" } },
  ])("never retries success or database errors", (result) => {
    expect(isTransientRpcFailure(result)).toBe(false);
  });
});

describe("summarizeRpcError", () => {
  it("reduces an HTML error page to its title", () => {
    expect(summarizeRpcError({ message: cloudflareDnsPage }, "fallback")).toBe(
      "Upstream HTML error: DNS resolution error | example.supabase.co | Cloudflare",
    );
  });

  it("keeps plain messages and falls back when empty", () => {
    expect(summarizeRpcError({ message: "lease expired" }, "fallback")).toBe("lease expired");
    expect(summarizeRpcError(null, "fallback")).toBe("fallback");
  });
});

describe("callCronRpc", () => {
  it("retries a transient failure and returns the recovered result", async () => {
    vi.useFakeTimers();
    const call = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: { message: cloudflareDnsPage } })
      .mockResolvedValueOnce({ data: true, error: null });

    const pending = callCronRpc(call);
    await vi.runAllTimersAsync();

    expect(await pending).toEqual({ data: true, error: null });
    expect(call).toHaveBeenCalledTimes(2);
  });

  it("stops after three attempts", async () => {
    vi.useFakeTimers();
    const call = vi.fn().mockResolvedValue({ data: null, error: { message: "fetch failed" } });

    const pending = callCronRpc(call);
    await vi.runAllTimersAsync();

    expect((await pending).error?.message).toBe("fetch failed");
    expect(call).toHaveBeenCalledTimes(3);
  });

  it("does not retry a database error", async () => {
    const call = vi.fn().mockResolvedValue({ data: null, error: { message: "permission denied" } });

    await callCronRpc(call);

    expect(call).toHaveBeenCalledOnce();
  });
});
