import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    constructEvent: vi.fn(),
    withClaim: vi.fn(),
}));

vi.mock("@/services/stripe/client", () => ({
    stripe: { webhooks: { constructEvent: mocks.constructEvent } },
}));
vi.mock("@/services/stripe/webhook-claim", () => ({
    withStripeWebhookClaim: mocks.withClaim,
}));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: () => ({}) }));
vi.mock("@/services/stripe/webhook-checkout-completed", () => ({
    handleCheckoutSessionCompleted: vi.fn(),
}));
vi.mock("@/services/stripe/webhook-subscription-changed", () => ({
    handleSubscriptionDeleted: vi.fn(), handleSubscriptionUpdated: vi.fn(),
}));
vi.mock("@/services/stripe/webhook-invoice-events", () => ({
    handleInvoicePaymentFailed: vi.fn(), handleInvoicePaymentSucceeded: vi.fn(),
}));

import { handleStripeWebhook } from "@/services/stripe/webhook-handler";

function signedRequest() {
    return new Request("http://localhost/api/webhooks/stripe", {
        method: "POST", body: "{}", headers: { "stripe-signature": "test-signature" },
    });
}

describe("Stripe webhook HTTP retries", () => {
    const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;

    beforeEach(() => {
        process.env.STRIPE_WEBHOOK_SECRET = "test-webhook-secret";
        mocks.constructEvent.mockReturnValue({ id: "evt_test", type: "unhandled.test" });
    });

    afterEach(() => {
        process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
        vi.clearAllMocks();
    });

    it("returns retryable status while another delivery owns the claim", async () => {
        mocks.withClaim.mockResolvedValue("in-progress");
        const response = await handleStripeWebhook(signedRequest());
        expect(response.status).toBe(503);
    });

    it("acknowledges only an already completed duplicate", async () => {
        mocks.withClaim.mockResolvedValue("already-processed");
        const response = await handleStripeWebhook(signedRequest());
        expect(response.status).toBe(200);
    });

    it("returns retryable status when processing fails", async () => {
        mocks.withClaim.mockRejectedValue(new Error("billing write failed"));
        const response = await handleStripeWebhook(signedRequest());
        expect(response.status).toBe(500);
    });
});
