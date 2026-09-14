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
      is: vi
        .fn()
        .mockResolvedValue({
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
});
