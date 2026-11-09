import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WebhookAdminClient } from "@/services/stripe/webhook-types";

const m = vi.hoisted(() => ({ live: vi.fn(), subRetrieve: vi.fn(), lines: vi.fn(), plan: vi.fn(),
    email: vi.fn(), rpc: vi.fn(), logError: vi.fn(), captureMessage: vi.fn() }));
vi.mock("@/lib/features/aeo-surfaces", async (orig) => ({ ...(await orig<object>()), isMeteredBillingLive: m.live }));
vi.mock("@/services/stripe/client", () => ({ stripe: {
    subscriptions: { retrieve: m.subRetrieve }, invoices: { listLineItems: m.lines },
} }));
vi.mock("@/services/stripe/plans", () => ({ getPlanByPriceId: m.plan }));
vi.mock("@/services/stripe/meta-paid-subscription-event", () => ({
    sendMetaPaidSubscriptionEvent: vi.fn(), shouldTrackFirstPaidSubscription: () => false }));
vi.mock("@/services/resend/send-email", () => ({ sendEmail: m.email }));
vi.mock("@/lib/logger", () => ({ logger: { error: m.logError, warn: vi.fn(), info: vi.fn(), debug: vi.fn() } }));
vi.mock("@sentry/nextjs", () => ({ captureMessage: m.captureMessage, captureException: vi.fn() }));

import { handleInvoicePaymentSucceeded } from "@/services/stripe/webhook-invoice-events";

const PERIOD_END = 2_000_000_000;

function cycleInvoice(price: string): Stripe.Invoice {
    return { id: "in_cycle", status: "paid", billing_reason: "subscription_cycle", customer: "cus_a",
        customer_email: "owner@example.com", amount_paid: 9900, currency: "usd",
        parent: { subscription_details: { subscription: "sub_a" } },
        lines: { has_more: false, data: [{ subscription: "sub_a", period: { start: 1_990_000_000, end: PERIOD_END },
            parent: { subscription_item_details: { subscription: "sub_a", proration: false } },
            pricing: { price_details: { price } } }] } } as unknown as Stripe.Invoice;
}

/** Org still projected on its last catalog plan (unknown-price projections preserve it). */
function db(): WebhookAdminClient {
    const query = { select: () => query, eq: () => query,
        maybeSingle: async () => ({ data: { id: "org_a", plan: "starter_monthly" }, error: null }) };
    return { from: () => query, rpc: m.rpc } as unknown as WebhookAdminClient;
}
const invoiceEvent = (invoice: Stripe.Invoice) => ({ data: { object: invoice }, created: 1 }) as unknown as Stripe.Event;

beforeEach(() => {
    vi.resetAllMocks();
    m.live.mockReturnValue(true);
    m.subRetrieve.mockResolvedValue({ id: "sub_a", customer: "cus_a", status: "active", metadata: {}, trial_end: null });
    m.rpc.mockResolvedValue({ data: true, error: null });
    m.plan.mockImplementation((price: string) => ({ price_starter: { id: "starter_monthly" },
        price_professional: { id: "professional_monthly" } } as Record<string, { id: string }>)[price] ?? null);
});

describe("renewal credit for a subscription on a price outside the plan catalog", () => {
    it("acknowledges the renewal, skips the grant and reports it instead of failing every month", async () => {
        await expect(handleInvoicePaymentSucceeded(invoiceEvent(cycleInvoice("price_enterprise_custom")), db()))
            .resolves.toBeUndefined();
        expect(m.rpc).not.toHaveBeenCalled();
        expect(m.logError).toHaveBeenCalledWith(expect.objectContaining({ customerId: "cus_a", subscriptionId: "sub_a",
            invoiceId: "in_cycle", priceIds: ["price_enterprise_custom"] }), expect.any(String));
        expect(m.captureMessage).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ level: "error" }));
        expect(m.email).toHaveBeenCalledOnce();
    });

    it("still grants against the plan line on a catalog renewal", async () => {
        await handleInvoicePaymentSucceeded(invoiceEvent(cycleInvoice("price_starter")), db());
        expect(m.rpc).toHaveBeenCalledWith("apply_stripe_credit_grant", expect.objectContaining({
            p_plan_id: "starter_monthly", p_receipt_id: "in_cycle",
            p_period_end: new Date(PERIOD_END * 1000).toISOString() }));
        expect(m.logError).not.toHaveBeenCalled();
    });

    it("stays retryable when the line is a catalog plan the org has not been projected onto yet", async () => {
        await expect(handleInvoicePaymentSucceeded(invoiceEvent(cycleInvoice("price_professional")), db()))
            .rejects.toThrow("Credit grant period missing");
        expect(m.rpc).not.toHaveBeenCalled();
        expect(m.email).not.toHaveBeenCalled();
    });
});
