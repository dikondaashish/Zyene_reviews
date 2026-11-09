import type Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
    constructEvent: vi.fn(), retrieve: vi.fn(), plan: vi.fn(), rpc: vi.fn(),
    logError: vi.fn(), captureMessage: vi.fn(), captureException: vi.fn(),
}));

vi.mock("@/services/stripe/client", () => ({ stripe: {
    webhooks: { constructEvent: m.constructEvent },
    subscriptions: { retrieve: m.retrieve }, customers: { retrieve: vi.fn() },
} }));
vi.mock("@/services/stripe/plans", () => ({
    getPlanByPriceId: m.plan,
    FREE_LIMITS: { maxLocations: 1, teamMembers: 1, smartRepliesPerMonth: 0,
        emailRequestsPerMonth: 0, smsRequestsPerMonth: 0, linkRequestsPerMonth: 0 },
}));
vi.mock("@/lib/logger", () => ({ logger: { error: m.logError, warn: vi.fn(), info: vi.fn(), debug: vi.fn() } }));
vi.mock("@sentry/nextjs", () => ({ captureMessage: m.captureMessage, captureException: m.captureException }));
vi.mock("@/lib/db/supabase/admin", () => ({ createAdminClient: () => ({ rpc: m.rpc }) }));
vi.mock("@/services/stripe/webhook-checkout-completed", () => ({ handleCheckoutSessionCompleted: vi.fn() }));
vi.mock("@/services/stripe/webhook-invoice-events", () => ({
    handleInvoicePaymentFailed: vi.fn(), handleInvoicePaymentSucceeded: vi.fn(),
}));
vi.mock("@/services/stripe/recovered-cycle-credit-grant", () => ({
    grantRecoveredCycleCredit: vi.fn(), isRecoveryToEntitled: () => false,
}));
vi.mock("@/services/resend/send-email", () => ({ sendEmail: vi.fn() }));

import { stripeSubscriptionToOrganizationUpdate } from "@/services/stripe/organization-billing-sync";
import { handleStripeWebhook } from "@/services/stripe/webhook-handler";

const LIMIT_KEYS = ["max_businesses", "max_team_members", "max_review_requests_per_month",
    "max_ai_replies_per_month", "max_email_requests_per_month", "max_sms_requests_per_month",
    "max_link_requests_per_month"];

function subscription(status = "active", priceId = "price_enterprise_custom"): Stripe.Subscription {
    return { id: "sub_ent", customer: "cus_ent", status, metadata: {}, trial_end: null,
        items: { data: [{ price: { id: priceId } }] } } as unknown as Stripe.Subscription;
}

function signedRequest() {
    return new Request("http://localhost/api/webhooks/stripe", {
        method: "POST", body: "{}", headers: { "stripe-signature": "test-signature" },
    });
}

describe("subscriptions on a price outside the plan catalog", () => {
    const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;

    beforeEach(() => {
        process.env.STRIPE_WEBHOOK_SECRET = "test-webhook-secret";
        m.plan.mockReturnValue(null);
        m.retrieve.mockResolvedValue(subscription());
        m.constructEvent.mockReturnValue({ id: "evt_ent", type: "customer.subscription.updated",
            data: { object: { id: "sub_ent" } } });
        m.rpc.mockImplementation(async (fn: string) => {
            if (fn === "claim_stripe_webhook_event") return { data: "claimed", error: null };
            if (fn === "finish_stripe_webhook_event") return { data: true, error: null };
            return { data: "org_ent", error: null };
        });
    });

    afterEach(() => {
        process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
        vi.resetAllMocks();
    });

    it.each(["active", "trialing", "past_due"])("keeps plan and limits unchanged for a %s subscription", (status) => {
        const projection = stripeSubscriptionToOrganizationUpdate(subscription(status));
        expect(projection).toMatchObject({ plan_status: status, stripe_subscription_id: "sub_ent",
            preserve_entitlements: true });
        expect(projection).not.toHaveProperty("plan");
        for (const key of LIMIT_KEYS) expect(projection).not.toHaveProperty(key);
    });

    it("reports the customer, subscription and price at error level", () => {
        stripeSubscriptionToOrganizationUpdate(subscription());
        const context = { customerId: "cus_ent", subscriptionId: "sub_ent", priceId: "price_enterprise_custom" };
        expect(m.logError).toHaveBeenCalledWith(expect.objectContaining(context), expect.any(String));
        expect(m.captureMessage).toHaveBeenCalledWith("Unrecognized Stripe subscription price",
            expect.objectContaining({ level: "error", extra: expect.objectContaining(context) }));
    });

    it("still projects a known price normally", () => {
        m.plan.mockReturnValue({ id: "starter_monthly", limits: { maxLocations: 1, teamMembers: 5,
            smartRepliesPerMonth: 10, emailRequestsPerMonth: 20, smsRequestsPerMonth: 30, linkRequestsPerMonth: 40 } });
        const projection = stripeSubscriptionToOrganizationUpdate(subscription("active", "price_known"));
        expect(projection).toMatchObject({ plan: "starter_monthly", max_team_members: 5, max_review_requests_per_month: 90 });
        expect(projection).not.toHaveProperty("preserve_entitlements");
        expect(m.logError).not.toHaveBeenCalled();
    });

    it("ended subscriptions still fall back to the free plan without a price lookup", () => {
        const projection = stripeSubscriptionToOrganizationUpdate(subscription("canceled"));
        expect(projection).toMatchObject({ plan: "free", plan_status: "canceled", max_ai_replies_per_month: 0 });
        expect(projection).not.toHaveProperty("preserve_entitlements");
    });

    it("acknowledges the webhook and marks the event processed instead of making Stripe retry", async () => {
        const response = await handleStripeWebhook(signedRequest());
        expect(response.status).toBe(200);
        expect(m.rpc).toHaveBeenCalledWith("apply_stripe_subscription_projection", expect.objectContaining({
            p_customer_id: "cus_ent", p_subscription_id: "sub_ent",
            p_projection: expect.objectContaining({ plan_status: "active", preserve_entitlements: true }),
        }));
        const projection = m.rpc.mock.calls.find(([fn]) => fn === "apply_stripe_subscription_projection")?.[1].p_projection;
        expect(projection).not.toHaveProperty("plan");
        expect(m.rpc).toHaveBeenCalledWith("finish_stripe_webhook_event", expect.objectContaining({ p_succeeded: true }));
        expect(m.captureException).not.toHaveBeenCalled();
    });
});
