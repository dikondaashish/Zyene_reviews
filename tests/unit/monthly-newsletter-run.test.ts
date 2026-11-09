import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("@/lib/db/supabase/admin", () => ({
  createAdminClient: () => ({ from: mocks.from }),
}));
vi.mock("@/services/resend/send-email", () => ({ sendEmail: mocks.sendEmail }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));

import { runMonthlyNewsletter } from "../../src/services/cron/monthly-newsletter-run";

describe("runMonthlyNewsletter", () => {
  beforeEach(() => {
    mocks.from.mockReset();
    mocks.sendEmail.mockReset();
  });

  it("does not resend an edition already accepted for a subscriber", async () => {
    const subscribers = {
      select: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: [{ id: "subscriber-1", email: "one@example.com" }],
        error: null,
      }),
    };
    const deliveries = {
      upsert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: "delivery-1", status: "sent", attempt_count: 1 },
        error: null,
      }),
    };
    mocks.from.mockImplementation((table: string) =>
      table === "marketing_subscribers" ? subscribers : deliveries,
    );

    const result = await runMonthlyNewsletter(
      new Date("2026-09-14T13:00:00.000Z"),
    );

    expect(result).toEqual({ sent: 0, failed: 0, total: 1 });
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("sends in batches that stay under Resend's 10 requests per second", async () => {
    vi.useFakeTimers();
    try {
      const people = Array.from({ length: 20 }, (_, i) => ({
        id: `subscriber-${i}`,
        email: `s${i}@example.com`,
      }));
      const subscribers = {
        select: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: people, error: null }),
      };
      const deliveries = {
        upsert: vi.fn().mockResolvedValue({ error: null }),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { id: "delivery", status: "pending", attempt_count: 0 },
          error: null,
        }),
        then: (resolve: (value: { error: null }) => void) => resolve({ error: null }),
      };
      mocks.from.mockImplementation((table: string) =>
        table === "marketing_subscribers" ? subscribers : deliveries,
      );
      mocks.sendEmail.mockResolvedValue({ sent: true, id: "email" });

      const run = runMonthlyNewsletter(new Date("2026-11-01T16:00:00.000Z"));
      await vi.advanceTimersByTimeAsync(0);
      expect(mocks.sendEmail).toHaveBeenCalledTimes(8);
      await vi.advanceTimersByTimeAsync(1000);
      expect(mocks.sendEmail).toHaveBeenCalledTimes(16);
      await vi.advanceTimersByTimeAsync(1000);

      await expect(run).resolves.toEqual({ sent: 20, failed: 0, total: 20 });
    } finally {
      vi.useRealTimers();
    }
  });
  it("covers subscribers past the first 1000-row page", async () => {
    const page = (start: number, count: number) =>
      Array.from({ length: count }, (_, i) => ({
        id: `subscriber-${start + i}`,
        email: `s${start + i}@example.com`,
      }));
    const subscribers = {
      select: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi
        .fn()
        .mockResolvedValueOnce({ data: page(0, 1000), error: null })
        .mockResolvedValueOnce({ data: page(1000, 1), error: null }),
    };
    const deliveries = {
      upsert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: "delivery", status: "sent", attempt_count: 1 },
        error: null,
      }),
    };
    mocks.from.mockImplementation((table: string) =>
      table === "marketing_subscribers" ? subscribers : deliveries,
    );
    vi.useFakeTimers();
    try {
      const run = runMonthlyNewsletter(new Date("2026-11-01T16:00:00.000Z"));
      await vi.advanceTimersByTimeAsync(200_000);
      await expect(run).resolves.toEqual({ sent: 0, failed: 0, total: 1001 });
    } finally {
      vi.useRealTimers();
    }
    expect(subscribers.range.mock.calls).toEqual([
      [0, 999],
      [1000, 1999],
    ]);
    expect(deliveries.upsert).toHaveBeenCalledWith(
      { edition_key: "2026-11", subscriber_id: "subscriber-1000" },
      expect.anything(),
    );
  });
});
