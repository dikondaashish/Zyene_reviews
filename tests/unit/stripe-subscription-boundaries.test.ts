import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WebhookAdminClient } from "@/services/stripe/webhook-types";

const m = vi.hoisted(() => ({ retrieve: vi.fn(), customer: vi.fn(), email: vi.fn(), reset: vi.fn(), plan: vi.fn(),
    onboarding: vi.fn(), trial: vi.fn(), referral: vi.fn() }));
vi.mock("@/services/stripe/client", () => ({ stripe: {
    subscriptions: { retrieve: m.retrieve }, customers: { retrieve: m.customer },
} }));
vi.mock("@/services/stripe/plans", () => ({
    getPlanByPriceId: m.plan,
    FREE_LIMITS: { maxLocations: 1, teamMembers: 1, smartRepliesPerMonth: 0,
        emailRequestsPerMonth: 0, smsRequestsPerMonth: 0, linkRequestsPerMonth: 0 },
}));
vi.mock("@/services/resend/send-email", () => ({ sendEmail: m.email }));
vi.mock("@/services/aeo/billing/renewal-credit-reset", () => ({ resetAeoCreditsForPlan: m.reset }));
vi.mock("@/services/nfc/fulfill-checkout", () => ({ fulfillNfcCheckout: vi.fn() }));
vi.mock("@/lib/growth/schedule-growth-emails", () => ({ scheduleOnboardingDrip: m.onboarding, scheduleTrialNurture: m.trial }));
vi.mock("@/lib/growth/referral-rewards", () => ({ processReferralConversionReward: m.referral }));
vi.mock("@sentry/nextjs", () => ({ captureMessage: vi.fn(), captureException: vi.fn() }));

import { stripeSubscriptionToOrganizationUpdate } from "@/services/stripe/organization-billing-sync";
import { handleSubscriptionDeleted, handleSubscriptionUpdated } from "@/services/stripe/webhook-subscription-changed";
import { handleInvoicePaymentFailed, handleInvoicePaymentSucceeded } from "@/services/stripe/webhook-invoice-events";
import { handleCheckoutSessionCompleted } from "@/services/stripe/webhook-checkout-completed";

function event(object: Record<string, unknown>): Stripe.Event {
    return { data: { object } } as unknown as Stripe.Event;
}
function subscription(status = "active", customer = "cus_a", id = "sub_a"): Stripe.Subscription {
    return { id, customer, status, items: { data: [{ price: { id: "price_known" }, current_period_end: 1900000000 }] } } as unknown as Stripe.Subscription;
}
function db(row: unknown = { id: "org_a", stripe_customer_id: "cus_a", stripe_subscription_id: null, plan: "starter_monthly" }) {
    const rpc = vi.fn().mockResolvedValue({ data: "org_a", error: null });
    const filters: Record<string, string> = {};
    const query = {
        select: () => query,
        eq: (key: string, value: string) => { filters[key] = value; return query; },
        single: async () => ({ data: row, error: null }), maybeSingle: async () => ({ data: row, error: null }),
    };
    return { client: { rpc, from: () => query } as unknown as WebhookAdminClient, rpc, filters };
}

beforeEach(() => {
    vi.resetAllMocks(); m.retrieve.mockResolvedValue(subscription());
    m.plan.mockReturnValue({ id: "starter_monthly", name: "Starter", limits: {
        maxLocations: 1, teamMembers: 5, smartRepliesPerMonth: 10,
        emailRequestsPerMonth: 20, smsRequestsPerMonth: 30, linkRequestsPerMonth: 40,
    } });
    m.customer.mockResolvedValue({ deleted: true });
});

describe("Stripe billing projection boundaries", () => {
    it.each(["incomplete", "incomplete_expired", "paused", "unpaid", "canceled"])("does not grant paid entitlements for %s", (status) => {
        const projection = stripeSubscriptionToOrganizationUpdate(subscription(status));
        expect(projection.plan).toBe("free"); expect(projection.plan_status).not.toBe("active");
        expect(projection.max_ai_replies_per_month).toBe(0);
    });
    it("rejects unknown paid prices instead of silently granting Starter", () => {
        m.plan.mockReturnValue(null);
        expect(() => stripeSubscriptionToOrganizationUpdate(subscription())).toThrow("Unrecognized");
    });
    it("uses live Stripe state instead of an outdated event payload", async () => {
        const { client, rpc } = db(); m.retrieve.mockResolvedValue(subscription("past_due"));
        await handleSubscriptionUpdated(event({ id: "sub_a", status: "active" }), client);
        expect(rpc).toHaveBeenCalledWith("apply_stripe_subscription_projection", expect.objectContaining({
            p_customer_id: "cus_a", p_subscription_id: "sub_a", p_projection: expect.objectContaining({ plan_status: "past_due" }),
        }));
    });
    it("a late deletion has no email or cross-subscription side effects", async () => {
        const { client, rpc } = db(); rpc.mockResolvedValue({ data: null, error: null });
        await handleSubscriptionDeleted(event({ id: "sub_old", customer: "cus_a" }), client);
        expect(rpc).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ p_subscription_id: "sub_old", p_clear: true }));
        expect(m.email).not.toHaveBeenCalled(); expect(m.customer).not.toHaveBeenCalled();
    });
    it("propagates critical database failures for Stripe retry", async () => {
        const { client, rpc } = db(); rpc.mockResolvedValue({ data: null, error: new Error("failed") });
        await expect(handleSubscriptionDeleted(event({ id: "sub_a", customer: "cus_a" }), client)).rejects.toThrow("failed");
    });
    it("a one-off failed invoice cannot suspend a subscription", async () => {
        const { client, rpc } = db(); await handleInvoicePaymentFailed(event({ customer: "cus_a", parent: null }), client);
        expect(rpc).not.toHaveBeenCalled(); expect(m.retrieve).not.toHaveBeenCalled();
    });
    it("does not apply an old payment failure after the subscription recovered", async () => {
        const { client, rpc } = db();
        await handleInvoicePaymentFailed(event({ customer: "cus_a", parent: { subscription_details: { subscription: "sub_a" } } }), client);
        expect(rpc.mock.calls[0][1].p_projection.plan_status).toBe("active");
        expect(m.email).not.toHaveBeenCalled();
    });
    it("does not grant renewal credits to a replacement subscription", async () => {
        const { client, filters } = db(null);
        await handleInvoicePaymentSucceeded(event({ id: "in_old", billing_reason: "subscription_cycle", customer: "cus_a",
            parent: { subscription_details: { subscription: "sub_old" } } }), client);
        expect(filters).toMatchObject({ stripe_customer_id: "cus_a", stripe_subscription_id: "sub_old" });
        expect(m.reset).not.toHaveBeenCalled();
    });
    it("rejects checkout metadata for a different customer's organization", async () => {
        const { client, rpc } = db({ stripe_customer_id: "cus_foreign", stripe_subscription_id: null });
        await expect(handleCheckoutSessionCompleted(event({ id: "cs_a", customer: "cus_a", subscription: "sub_a",
            metadata: { organization_id: "org_a" } }), client)).rejects.toThrow("customer mismatch");
        expect(rpc).not.toHaveBeenCalled();
    });
    it("does not replace an active subscription with an older checkout", async () => {
        const { client, rpc } = db({ stripe_customer_id: "cus_a", stripe_subscription_id: "sub_new" });
        m.retrieve.mockResolvedValue(subscription("active", "cus_a", "sub_new"));
        await handleCheckoutSessionCompleted(event({ id: "cs_old", customer: "cus_a", subscription: "sub_old",
            metadata: { organization_id: "org_a" } }), client);
        expect(rpc).not.toHaveBeenCalled();
    });
    it("retries an incomplete credit grant even after billing has been linked", async () => {
        const { client } = db({ stripe_customer_id: "cus_a", stripe_subscription_id: "sub_a" });
        m.reset.mockRejectedValueOnce(new Error("credit write failed")).mockResolvedValueOnce(undefined);
        const checkout = event({ id: "cs_a", customer: "cus_a", subscription: "sub_a", metadata: { organization_id: "org_a" },
            customer_details: { email: "fixture@example.test", name: "Fixture" } });
        await expect(handleCheckoutSessionCompleted(checkout, client)).rejects.toThrow("credit write failed");
        expect(m.email).not.toHaveBeenCalled(); expect(m.onboarding).not.toHaveBeenCalled();
        await handleCheckoutSessionCompleted(checkout, client);
        expect(m.reset).toHaveBeenCalledTimes(2);
        expect(m.reset.mock.calls[1][1]).toMatchObject({ receiptId: "checkout:cs_a", subscriptionId: "sub_a" });
        expect(m.email).toHaveBeenCalledWith(expect.objectContaining({ idempotencyKey: "stripe-checkout:cs_a" }));
        expect(m.onboarding).toHaveBeenCalledTimes(1);
        expect(m.referral).toHaveBeenCalledWith("org_a");
    });
    it("keeps checkout referral failures retryable before any welcome notification", async () => {
        const { client } = db(); m.referral.mockRejectedValue(new Error("referral credit failed"));
        await expect(handleCheckoutSessionCompleted(event({ id: "cs_a", customer: "cus_a", subscription: "sub_a",
            metadata: { organization_id: "org_a" }, customer_details: { email: "fixture@example.test" } }),
            client)).rejects.toThrow("referral credit failed");
        expect(m.email).not.toHaveBeenCalled(); expect(m.onboarding).not.toHaveBeenCalled();
    });
    it("keeps trial-conversion referral failures retryable", async () => {
        const { client } = db(); m.referral.mockRejectedValue(new Error("referral credit failed"));
        const converted = event({ id: "sub_a" });
        converted.data.previous_attributes = { status: "trialing" };
        await expect(handleSubscriptionUpdated(converted, client)).rejects.toThrow("referral credit failed");
        expect(m.customer).not.toHaveBeenCalled(); expect(m.onboarding).not.toHaveBeenCalled();
    });
});
