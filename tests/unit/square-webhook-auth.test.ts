import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/square/config", () => ({
  getSquareWebhookNotificationUrl: () =>
    "https://example.com/api/webhooks/square",
  getSquareWebhookSignatureKey: () => null,
}));
vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { POST } from "../../src/app/api/webhooks/square/route";

describe("Square webhook authentication", () => {
  it("fails closed in every environment when its signature key is missing", async () => {
    const response = await POST(
      new Request("https://example.com/api/webhooks/square", {
        method: "POST",
        body: JSON.stringify({ type: "payment.created" }),
      }),
    );

    expect(response.status).toBe(503);
  });
});
