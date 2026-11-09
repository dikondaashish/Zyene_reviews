import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WebhookAdminClient } from "@/services/stripe/webhook-types";

const m = vi.hoisted(() => ({ retrieve: vi.fn(), list: vi.fn(), cancel: vi.fn(), captureMessage: vi.fn(), error: vi.fn(), reset: vi.fn(),
    invoiceList: vi.fn(), voidInvoice: vi.fn() }));
vi.mock("@/services/stripe/client", () => ({ stripe: {
    subscriptions: { retrieve: m.retrieve, list: m.list, cancel: m.cancel },
    invoices: { list: m.invoiceList, voidInvoice: m.voidInvoice },
} }));
vi.mock("@/services/stripe/plans", () => ({
    getPlanByPriceId: (priceId: string) => priceId === "price_offcatalog" ? null : ({ id: "starter_monthly", name: "Starter", limits: { maxLocations: 1, teamMembers: 5,
        smartRepliesPerMonth: 10, emailRequestsPerMonth: 20, smsRequestsPerMonth: 30, linkRequestsPerMonth: 40 } }),
    FREE_LIMITS: { maxLocations: 1, teamMembers: 1, smartRepliesPerMonth: 0,
        emailRequestsPerMonth: 0, smsRequestsPerMonth: 0, linkRequestsPerMonth: 0 },
}));
vi.mock("@/lib/logger", () => ({ logger: { error: m.error, warn: vi.fn(), info: vi.fn() } }));
vi.mock("@sentry/nextjs", () => ({ captureMessage: m.captureMessage, captureException: vi.fn() }));
vi.mock("@/services/resend/send-email", () => ({ sendEmail: vi.fn() }));
vi.mock("@/services/aeo/billing/renewal-credit-reset", () => ({ resetAeoCreditsForPlan: m.reset }));
vi.mock("@/services/nfc/fulfill-checkout", () => ({ fulfillNfcCheckout: vi.fn() }));
vi.mock("@/lib/growth/schedule-growth-emails", () => ({ scheduleTrialNurture: vi.fn() }));
vi.mock("@/lib/growth/referral-rewards", () => ({ processReferralConversionReward: vi.fn() }));

import { handleCheckoutSessionCompleted } from "@/services/stripe/webhook-checkout-completed";

const subscription = (id: string, status: string) => ({ id, status, customer: "cus_a", metadata: {}, trial_end: null,
    items: { data: [{ price: { id: "price_known" }, current_period_end: 1900000000 }] } });
const checkout = { data: { object: { id: "cs_dup", customer: "cus_a", subscription: "sub_new",
    metadata: { organization_id: "org_a" } } } } as unknown as Stripe.Event;
function db() {
    const rpc = vi.fn().mockResolvedValue({ data: "org_a", error: null });
    const row = { stripe_customer_id: "cus_a", stripe_subscription_id: "sub_old" };
    const query = { select: () => query, eq: () => query, single: async () => ({ data: row, error: null }) };
    return { client: { rpc, from: () => query } as unknown as WebhookAdminClient, rpc };
}
function statuses(map: Record<string, string>) {
    m.retrieve.mockImplementation(async (id: string) => subscription(id, map[id] ?? "active"));
}

beforeEach(() => {
    vi.resetAllMocks();
    m.list.mockResolvedValue({ data: [] });
    m.invoiceList.mockResolvedValue({ data: [] });
    m.voidInvoice.mockResolvedValue({});
});
type Other = [id: string, status: string, opts?: { org?: string; price?: string; comment?: string }];
function others(list: Other[]) {
    m.list.mockResolvedValue({ data: list.map(([id, status, opts]) => ({
        id, status, metadata: opts?.org ? { organization_id: opts.org } : {},
        cancellation_details: opts?.comment ? { comment: opts.comment } : null,
        items: { data: [{ price: { id: opts?.price ?? "price_known" } }] },
    })) });
}

describe("checkout.session.completed while the org already has a subscription", () => {
    it("alerts at error level with both ids when a second live subscription was created", async () => {
        statuses({ sub_old: "active", sub_new: "trialing" });
        const { client, rpc } = db();
        await handleCheckoutSessionCompleted(checkout, client);
        const expected = { organizationId: "org_a", existingSubscriptionId: "sub_old", checkoutSubscriptionId: "sub_new" };
        expect(m.error).toHaveBeenCalledWith(expect.objectContaining(expected), expect.stringContaining("Duplicate live Stripe subscription"));
        expect(m.captureMessage).toHaveBeenCalledWith(expect.any(String),
            expect.objectContaining({ level: "error", extra: expect.objectContaining(expected) }));
        expect(rpc).not.toHaveBeenCalled();
        expect(m.reset).not.toHaveBeenCalled();
    });

    it("stays quiet when the checkout's own subscription is already dead", async () => {
        statuses({ sub_old: "active", sub_new: "incomplete_expired" });
        const { client, rpc } = db();
        await handleCheckoutSessionCompleted(checkout, client);
        expect(m.error).not.toHaveBeenCalled();
        expect(m.captureMessage).not.toHaveBeenCalled();
        expect(rpc).not.toHaveBeenCalled();
    });

    it("binds the new subscription when the stored one is canceled", async () => {
        statuses({ sub_old: "canceled", sub_new: "active" });
        const { client, rpc } = db();
        await handleCheckoutSessionCompleted(checkout, client);
        expect(m.captureMessage).not.toHaveBeenCalled();
        expect(rpc).toHaveBeenCalledWith("apply_stripe_subscription_projection", expect.objectContaining({ p_subscription_id: "sub_new" }));
    });

    it("binds the new subscription when the stored one no longer exists in Stripe", async () => {
        m.retrieve.mockImplementation(async (id: string) => {
            if (id === "sub_old") throw Object.assign(new Error("No such subscription"), { code: "resource_missing" });
            return subscription(id, "active");
        });
        const { client, rpc } = db();
        await handleCheckoutSessionCompleted(checkout, client);
        expect(rpc).toHaveBeenCalledWith("apply_stripe_subscription_projection", expect.objectContaining({ p_subscription_id: "sub_new" }));
    });

    it("lets a transient error looking up the stored subscription retry the webhook", async () => {
        m.retrieve.mockRejectedValue(Object.assign(new Error("Stripe 500"), { type: "StripeAPIError" }));
        const { client, rpc } = db();
        await expect(handleCheckoutSessionCompleted(checkout, client)).rejects.toThrow("Stripe 500");
        expect(rpc).not.toHaveBeenCalled();
    });
});

describe("after binding the checkout subscription", () => {
    it("cancels this org's other unpaid plan subscription even when the billing page already unbound it", async () => {
        statuses({ sub_old: "canceled", sub_new: "active", sub_unpaid: "unpaid" });
        others([["sub_new", "active"], ["sub_unpaid", "unpaid"]]);
        const { client, rpc } = db();
        await handleCheckoutSessionCompleted(checkout, client);
        expect(m.cancel).toHaveBeenCalledWith("sub_unpaid", expect.objectContaining({ cancellation_details: expect.anything() }));
        expect(m.cancel).toHaveBeenCalledTimes(1);
        // Only after the new subscription is bound and its credit granted.
        expect(rpc.mock.invocationCallOrder[0]).toBeLessThan(m.cancel.mock.invocationCallOrder[0]);
        expect(m.reset.mock.invocationCallOrder[0]).toBeLessThan(m.cancel.mock.invocationCallOrder[0]);
    });

    it("keeps a subscription that was paid between the list and the cancel", async () => {
        statuses({ sub_old: "canceled", sub_new: "active", sub_unpaid: "active" });
        others([["sub_unpaid", "unpaid"]]);
        const { client } = db();
        await handleCheckoutSessionCompleted(checkout, client);
        expect(m.cancel).not.toHaveBeenCalled();
    });

    it("never touches another org's subscription or a dashboard-made off-catalog one", async () => {
        statuses({ sub_old: "canceled", sub_new: "active", sub_other_org: "unpaid", sub_addon: "unpaid" });
        others([
            ["sub_other_org", "unpaid", { org: "org_b" }],
            ["sub_addon", "unpaid", { price: "price_offcatalog" }],
            ["sub_other_org_live", "active", { org: "org_b" }],
        ]);
        const { client } = db();
        await handleCheckoutSessionCompleted(checkout, client);
        expect(m.cancel).not.toHaveBeenCalled();
        expect(m.captureMessage).not.toHaveBeenCalled();
    });

    it("alerts on this org's other live subscription and never cancels it", async () => {
        statuses({ sub_old: "canceled", sub_new: "active" });
        others([["sub_new", "active"], ["sub_other", "past_due", { org: "org_a" }], ["sub_pending", "incomplete"]]);
        const { client } = db();
        await handleCheckoutSessionCompleted(checkout, client);
        expect(m.cancel).not.toHaveBeenCalled();
        expect(m.captureMessage).toHaveBeenCalledTimes(1);
        expect(m.captureMessage).toHaveBeenCalledWith(expect.stringMatching(/duplicate/i),
            expect.objectContaining({ extra: expect.objectContaining({ otherSubscriptionId: "sub_other" }) }));
    });

    it("retries the webhook when the unpaid cancel fails, after the credit grant already landed", async () => {
        statuses({ sub_old: "canceled", sub_new: "active", sub_unpaid: "unpaid" });
        others([["sub_unpaid", "unpaid"]]);
        m.cancel.mockRejectedValue(Object.assign(new Error("Stripe 500"), { type: "StripeAPIError" }));
        const { client } = db();
        await expect(handleCheckoutSessionCompleted(checkout, client)).rejects.toThrow("Stripe 500");
        expect(m.reset).toHaveBeenCalledTimes(1);
    });

    it("treats an unpaid subscription that is already gone as done", async () => {
        statuses({ sub_old: "canceled", sub_new: "active", sub_unpaid: "unpaid" });
        others([["sub_unpaid", "unpaid"]]);
        m.cancel.mockRejectedValue(Object.assign(new Error("No such subscription"), { code: "resource_missing" }));
        const { client } = db();
        await expect(handleCheckoutSessionCompleted(checkout, client)).resolves.toBeUndefined();
    });

    it("voids the replaced subscription's open invoices, only after it is cancelled", async () => {
        statuses({ sub_old: "canceled", sub_new: "active", sub_unpaid: "unpaid" });
        others([["sub_unpaid", "unpaid"]]);
        m.invoiceList.mockResolvedValue({ data: [{ id: "in_dunning" }, { id: "in_older" }] });
        const { client } = db();
        await handleCheckoutSessionCompleted(checkout, client);
        expect(m.invoiceList).toHaveBeenCalledWith(expect.objectContaining({ subscription: "sub_unpaid", status: "open" }));
        expect(m.voidInvoice.mock.calls.map((c) => c[0])).toEqual(["in_dunning", "in_older"]);
        // Voiding first could revive the subscription to active; cancel must come first.
        expect(m.cancel.mock.invocationCallOrder[0]).toBeLessThan(m.voidInvoice.mock.invocationCallOrder[0]);
    });

    it("finishes voiding on a retry after the cancel already landed", async () => {
        statuses({ sub_old: "canceled", sub_new: "active" });
        others([["sub_unpaid", "canceled", { comment: "Replaced by sub_new at checkout cs_dup" }]]);
        m.invoiceList.mockResolvedValue({ data: [{ id: "in_dunning" }] });
        const { client } = db();
        await handleCheckoutSessionCompleted(checkout, client);
        expect(m.cancel).not.toHaveBeenCalled();
        expect(m.voidInvoice).toHaveBeenCalledWith("in_dunning");
    });

    it("never voids invoices of a subscription it did not cancel", async () => {
        statuses({ sub_old: "canceled", sub_new: "active" });
        others([["sub_history", "canceled"], ["sub_user_canceled", "canceled", { comment: "Too expensive" }]]);
        const { client } = db();
        await handleCheckoutSessionCompleted(checkout, client);
        expect(m.invoiceList).not.toHaveBeenCalled();
        expect(m.voidInvoice).not.toHaveBeenCalled();
    });

    it("does not void when the subscription was paid just before the cancel", async () => {
        statuses({ sub_old: "canceled", sub_new: "active", sub_unpaid: "active" });
        others([["sub_unpaid", "unpaid"]]);
        const { client } = db();
        await handleCheckoutSessionCompleted(checkout, client);
        expect(m.cancel).not.toHaveBeenCalled();
        expect(m.invoiceList).not.toHaveBeenCalled();
    });

    it("retries the webhook when voiding fails", async () => {
        statuses({ sub_old: "canceled", sub_new: "active", sub_unpaid: "unpaid" });
        others([["sub_unpaid", "unpaid"]]);
        m.invoiceList.mockResolvedValue({ data: [{ id: "in_dunning" }] });
        m.voidInvoice.mockRejectedValue(Object.assign(new Error("Stripe 500"), { type: "StripeAPIError" }));
        const { client } = db();
        await expect(handleCheckoutSessionCompleted(checkout, client)).rejects.toThrow("Stripe 500");
    });
});
