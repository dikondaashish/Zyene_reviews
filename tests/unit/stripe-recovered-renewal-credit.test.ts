import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeDb, type FakeDb } from "./helpers/fake-supabase";
import type { WebhookAdminClient } from "@/services/stripe/webhook-types";

const m = vi.hoisted(() => ({ live: vi.fn(), subRetrieve: vi.fn(), invRetrieve: vi.fn(), lines: vi.fn(),
    customer: vi.fn(), plan: vi.fn(), email: vi.fn() }));
vi.mock("@/lib/features/aeo-surfaces", async (orig) => ({ ...(await orig<object>()), isMeteredBillingLive: m.live }));
vi.mock("@/services/stripe/client", () => ({ stripe: {
    subscriptions: { retrieve: m.subRetrieve }, customers: { retrieve: m.customer },
    invoices: { retrieve: m.invRetrieve, listLineItems: m.lines },
} }));
vi.mock("@/services/stripe/plans", () => ({
    getPlanByPriceId: m.plan,
    FREE_LIMITS: { maxLocations: 1, teamMembers: 1, smartRepliesPerMonth: 0,
        emailRequestsPerMonth: 0, smsRequestsPerMonth: 0, linkRequestsPerMonth: 0 },
}));
vi.mock("@/services/stripe/meta-paid-subscription-event", () => ({
    sendMetaPaidSubscriptionEvent: vi.fn(), shouldTrackFirstPaidSubscription: () => false }));
vi.mock("@/services/resend/send-email", () => ({ sendEmail: m.email }));
vi.mock("@/lib/growth/referral-rewards", () => ({ processReferralConversionReward: vi.fn() }));
vi.mock("@/lib/growth/schedule-growth-emails", () => ({ scheduleOnboardingDrip: vi.fn() }));
vi.mock("@sentry/nextjs", () => ({ captureMessage: vi.fn(), captureException: vi.fn() }));

import { handleSubscriptionUpdated } from "@/services/stripe/webhook-subscription-changed";
import { handleInvoicePaymentSucceeded } from "@/services/stripe/webhook-invoice-events";

const PERIOD_END = 2_000_000_000;
type Row = Record<string, unknown>;

function cycleInvoice(overrides: Row = {}): Stripe.Invoice {
    return { id: "in_cycle", status: "paid", billing_reason: "subscription_cycle", customer: "cus_a",
        parent: { subscription_details: { subscription: "sub_a" } },
        lines: { has_more: false, data: [{ subscription: "sub_a", period: { start: 1_990_000_000, end: PERIOD_END },
            parent: { subscription_item_details: { subscription: "sub_a", proration: false } },
            pricing: { price_details: { price: "price_starter" } } }] },
        ...overrides } as unknown as Stripe.Invoice;
}
function liveSubscription(status = "active", latestInvoice: string | null = "in_cycle"): Stripe.Subscription {
    return { id: "sub_a", customer: "cus_a", status, metadata: {}, trial_end: null, latest_invoice: latestInvoice,
        items: { data: [{ price: { id: "price_starter" }, current_period_end: PERIOD_END }] } } as unknown as Stripe.Subscription;
}
function subscriptionUpdated(previousStatus?: string): Stripe.Event {
    return { data: { object: { id: "sub_a" }, ...(previousStatus ? { previous_attributes: { status: previousStatus } } : {}) } } as unknown as Stripe.Event;
}

/** Fake DB whose RPCs mirror apply_stripe_subscription_projection and apply_stripe_credit_grant. */
function billingDb(): FakeDb & { grants: number[] } {
    const fake = createFakeDb({ organizations: [{ id: "org_a", stripe_customer_id: "cus_a",
        stripe_subscription_id: "sub_a", plan: "starter_monthly", plan_status: "past_due" }],
    stripe_credit_grant_receipts: [] });
    const grants: number[] = [];
    const orgs = () => fake.tables.organizations;
    const receipts = () => fake.tables.stripe_credit_grant_receipts;
    (fake.client as unknown as { rpc: (name: string, args: Row) => Promise<unknown> }).rpc = async (name, args) => {
        if (name === "apply_stripe_subscription_projection") {
            const org = orgs().find((o) => o.stripe_customer_id === args.p_customer_id);
            if (!org) return { data: null, error: { message: "Subscription organization not found" } };
            if (org.stripe_subscription_id !== args.p_subscription_id) return { data: null, error: null };
            if (String(org.stripe_subscription_observed_at ?? "") > String(args.p_observed_at)) return { data: null, error: null };
            Object.assign(org, args.p_projection as Row, { stripe_subscription_observed_at: args.p_observed_at });
            return { data: org.id, error: null };
        }
        if (name === "apply_stripe_credit_grant") {
            const org = orgs().find((o) => o.id === args.p_organization_id);
            if (!org || org.stripe_customer_id !== args.p_customer_id || org.stripe_subscription_id !== args.p_subscription_id
                || org.plan !== args.p_plan_id || !["active", "trialing"].includes(String(org.plan_status))) return { data: false, error: null };
            if (receipts().some((r) => r.receipt_id === args.p_receipt_id
                || (r.organization_id === org.id && String(r.period_end) >= String(args.p_period_end)))) return { data: false, error: null };
            grants.push(Number(args.p_granted_micro_usd));
            receipts().push({ receipt_id: args.p_receipt_id, organization_id: org.id, period_end: args.p_period_end });
            return { data: true, error: null };
        }
        throw new Error(`unexpected rpc ${name}`);
    };
    return Object.assign(fake, { grants });
}
const client = (db: FakeDb) => db.client as unknown as WebhookAdminClient;
const invoiceEvent = (invoice: Stripe.Invoice) => ({ data: { object: invoice }, created: 1 }) as unknown as Stripe.Event;

beforeEach(() => {
    vi.resetAllMocks();
    m.live.mockReturnValue(true);
    m.subRetrieve.mockResolvedValue(liveSubscription());
    m.invRetrieve.mockResolvedValue(cycleInvoice());
    m.customer.mockResolvedValue({ deleted: true });
    m.plan.mockImplementation((price: string) => price === "price_starter" ? { id: "starter_monthly", name: "Starter",
        limits: { maxLocations: 1, teamMembers: 5, smartRepliesPerMonth: 10, emailRequestsPerMonth: 20,
            smsRequestsPerMonth: 30, linkRequestsPerMonth: 40 } } : null);
});

describe("renewal AEO credit after a smart-retry recovery", () => {
    it("grants when invoice.payment_succeeded lands before the past_due -> active update", async () => {
        const db = billingDb();
        await handleInvoicePaymentSucceeded(invoiceEvent(cycleInvoice()), client(db));
        expect(db.grants).toEqual([]); // refused: org still projected past_due
        await handleSubscriptionUpdated(subscriptionUpdated("past_due"), client(db));
        expect(db.grants).toEqual([5_000_000]);
        expect(db.tables.stripe_credit_grant_receipts).toEqual([expect.objectContaining({ receipt_id: "in_cycle",
            period_end: new Date(PERIOD_END * 1000).toISOString() })]);
    });
    it("grants exactly once when the subscription update lands first", async () => {
        const db = billingDb();
        await handleSubscriptionUpdated(subscriptionUpdated("past_due"), client(db));
        await handleInvoicePaymentSucceeded(invoiceEvent(cycleInvoice()), client(db));
        await handleSubscriptionUpdated(subscriptionUpdated("past_due"), client(db)); // Stripe redelivery
        expect(db.grants).toEqual([5_000_000]);
    });
    it("still grants when a newer snapshot (billing-page reconcile) made this event's projection stale", async () => {
        const db = billingDb();
        await handleInvoicePaymentSucceeded(invoiceEvent(cycleInvoice()), client(db));
        expect(db.grants).toEqual([]);
        // Reconcile with a later observedAt commits `active` before the webhook's projection.
        Object.assign(db.tables.organizations[0], { plan_status: "active", stripe_subscription_observed_at: "2999-01-01T00:00:00.000Z" });
        await handleSubscriptionUpdated(subscriptionUpdated("past_due"), client(db));
        expect(db.tables.organizations[0].stripe_subscription_observed_at).toBe("2999-01-01T00:00:00.000Z"); // projection skipped
        expect(db.grants).toEqual([5_000_000]);
        await handleSubscriptionUpdated(subscriptionUpdated("past_due"), client(db)); // redelivery
        expect(db.grants).toEqual([5_000_000]);
    });
    it("does not grant on a stale recovery when the newer snapshot is not entitled", async () => {
        const db = billingDb();
        db.tables.organizations[0].stripe_subscription_observed_at = "2999-01-01T00:00:00.000Z"; // still past_due
        await handleSubscriptionUpdated(subscriptionUpdated("past_due"), client(db));
        expect(m.invRetrieve).not.toHaveBeenCalled(); expect(db.grants).toEqual([]);
    });
    it("does not grant for a recovery of a subscription the org no longer uses", async () => {
        const db = billingDb();
        Object.assign(db.tables.organizations[0], { stripe_subscription_id: "sub_new", plan_status: "active" });
        await handleSubscriptionUpdated(subscriptionUpdated("past_due"), client(db));
        expect(m.invRetrieve).not.toHaveBeenCalled(); expect(db.grants).toEqual([]);
    });
    it("does not touch invoices for updates that are not a recovery", async () => {
        const db = billingDb();
        await handleSubscriptionUpdated(subscriptionUpdated(), client(db));
        await handleSubscriptionUpdated(subscriptionUpdated("trialing"), client(db));
        expect(m.invRetrieve).not.toHaveBeenCalled(); expect(db.grants).toEqual([]);
    });
    it.each([
        ["an unpaid invoice", { status: "open" }],
        ["a first invoice", { billing_reason: "subscription_create" }],
        ["a proration invoice", { billing_reason: "subscription_update" }],
        ["another customer's invoice", { customer: "cus_other" }],
        ["another subscription's invoice", { parent: { subscription_details: { subscription: "sub_other" } } }],
    ])("does not grant for %s", async (_label, overrides) => {
        const db = billingDb(); m.invRetrieve.mockResolvedValue(cycleInvoice(overrides));
        await handleSubscriptionUpdated(subscriptionUpdated("past_due"), client(db));
        expect(db.grants).toEqual([]);
    });
    it("skips without failing the webhook when the invoice has no line for the current plan", async () => {
        const db = billingDb();
        m.invRetrieve.mockResolvedValue(cycleInvoice({ lines: { has_more: false, data: [] } }));
        await expect(handleSubscriptionUpdated(subscriptionUpdated("past_due"), client(db))).resolves.toBeUndefined();
        expect(db.grants).toEqual([]);
    });
    it("does no provider work while metered billing is off", async () => {
        const db = billingDb(); m.live.mockReturnValue(false);
        await handleSubscriptionUpdated(subscriptionUpdated("past_due"), client(db));
        expect(m.invRetrieve).not.toHaveBeenCalled(); expect(db.grants).toEqual([]);
    });
});
