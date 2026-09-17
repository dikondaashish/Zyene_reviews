import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock("@/lib/db/supabase/admin", () => ({
  createAdminClient: () => ({ rpc: mocks.rpc }),
}));
vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn() },
}));

import { runCronJob } from "../../src/lib/cron/run-cron-job";

const originalSecret = process.env.CRON_SECRET;
const request = (authorization?: string) =>
  new Request("https://example.com/api/cron/test", {
    headers: authorization ? { Authorization: authorization } : undefined,
  });
const options = { name: "test-cron", cadence: "daily" as const };

beforeEach(() => {
  process.env.CRON_SECRET = "production-cron-secret";
  mocks.rpc.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
  if (originalSecret === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = originalSecret;
});

describe("runCronJob", () => {
  it.each([undefined, "production-cron-secret", "Bearer wrong-secret"])(
    "rejects missing, malformed, and invalid authorization before the claim or handler",
    async (authorization) => {
      const handler = vi.fn(async () => new Response("ok"));

      const response = await runCronJob(
        request(authorization),
        options,
        handler,
      );

      expect(response.status).toBe(401);
      expect(mocks.rpc).not.toHaveBeenCalled();
      expect(handler).not.toHaveBeenCalled();
    },
  );

  it("fails closed when CRON_SECRET is not configured", async () => {
    delete process.env.CRON_SECRET;
    const handler = vi.fn(async () => new Response("ok"));

    const response = await runCronJob(request(), options, handler);

    expect(response.status).toBe(503);
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
  });

  it("runs an acquired occurrence once and records completion", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-14T13:00:00.000Z"));
    mocks.rpc
      .mockResolvedValueOnce({
        data: [{ action: "acquired", lease_token: "lease", attempt_count: 1 }],
        error: null,
      })
      .mockResolvedValueOnce({ data: true, error: null });
    const handler = vi.fn(async () => new Response("ok"));

    const response = await runCronJob(
      request("Bearer production-cron-secret"),
      options,
      handler,
    );

    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledOnce();
    expect(mocks.rpc).toHaveBeenNthCalledWith(
      1,
      "claim_cron_job_run",
      expect.objectContaining({
        p_job_name: "test-cron",
        p_occurrence_key: "2026-09-14",
      }),
    );
    expect(mocks.rpc).toHaveBeenNthCalledWith(
      2,
      "complete_cron_job_run",
      expect.objectContaining({ p_lease_token: "lease" }),
    );
  });

  it.each([
    "already_completed",
    "already_running",
    "attempts_exhausted",
    "recovery_requires_review",
  ] as const)("does not re-run a %s occurrence", async (action) => {
    mocks.rpc.mockResolvedValueOnce({
      data: [{ action, lease_token: "lease", attempt_count: 1 }],
      error: null,
    });
    const handler = vi.fn(async () => new Response("ok"));

    const response = await runCronJob(
      request("Bearer production-cron-secret"),
      options,
      handler,
    );

    expect(response.status).toBe(200);
    expect(handler).not.toHaveBeenCalled();
    expect(mocks.rpc).toHaveBeenCalledOnce();
  });

  it("allows only the claimant to execute when two authenticated invocations overlap", async () => {
    mocks.rpc
      .mockResolvedValueOnce({
        data: [{ action: "acquired", lease_token: "lease", attempt_count: 1 }],
        error: null,
      })
      .mockResolvedValueOnce({
        data: [
          {
            action: "already_running",
            lease_token: "lease",
            attempt_count: 1,
          },
        ],
        error: null,
      })
      .mockResolvedValueOnce({ data: true, error: null });
    let startHandler!: () => void;
    let finishHandler!: () => void;
    const started = new Promise<void>((resolve) => {
      startHandler = resolve;
    });
    const finish = new Promise<void>((resolve) => {
      finishHandler = resolve;
    });
    const handler = vi.fn(async () => {
      startHandler();
      await finish;
      return new Response("ok");
    });

    const first = runCronJob(
      request("Bearer production-cron-secret"),
      options,
      handler,
    );
    await started;
    const second = await runCronJob(
      request("Bearer production-cron-secret"),
      options,
      handler,
    );
    finishHandler();
    await first;

    expect(second.status).toBe(200);
    expect(handler).toHaveBeenCalledOnce();
  });

  it("records a failed authorized handler without exposing its error", async () => {
    mocks.rpc
      .mockResolvedValueOnce({
        data: [{ action: "acquired", lease_token: "lease", attempt_count: 1 }],
        error: null,
      })
      .mockResolvedValueOnce({ data: true, error: null });

    const response = await runCronJob(
      request("Bearer production-cron-secret"),
      options,
      async () => {
        throw new Error("provider credential details");
      },
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Internal Server Error" });
    expect(mocks.rpc).toHaveBeenNthCalledWith(
      2,
      "fail_cron_job_run",
      expect.objectContaining({ p_failure_code: "exception" }),
    );
  });
});
