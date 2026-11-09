import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
    getUser: vi.fn(), member: vi.fn(), retrieve: vi.fn(), update: vi.fn(), cancel: vi.fn(), createSession: vi.fn(),
    captureException: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn(),
}));
vi.mock("@/lib/db/supabase/server", () => ({ createClient: async () => ({ auth: { getUser: m.getUser } }) }));
vi.mock("@/lib/billing/active-billing-member", () => ({ loadActiveBillingMember: m.member }));
vi.mock("@/services/stripe/client", () => ({ stripe: {
    subscriptions: { retrieve: m.retrieve, update: m.update, cancel: m.cancel },
    checkout: { sessions: { create: m.createSession } },
    customers: { create: vi.fn() },
} }));
vi.mock("@/services/stripe/plans", () => ({
    PLANS: [{ id: "starter_monthly", stripePriceId: "price_starter" }, { id: "pro_monthly", stripePriceId: "price_pro" }],
    getPlanByPriceId: (price: string) => (price === "price_pro" ? { id: "pro_monthly" } : { id: "starter_monthly" }),
    isPaidPlanTierUpgrade: (from: string, to: string) => from === "starter_monthly" && to === "pro_monthly",
    isPaidPlanTierDowngrade: (from: string, to: string) => from === "pro_monthly" && to === "starter_monthly",
}));
vi.mock("@/lib/stripe/checkout-trial-eligibility", () => ({ isEligibleForIntroTrial: async () => false }));
vi.mock("@/lib/growth/referral", () => ({ introTrialDaysForOrganization: () => 14 }));
vi.mock("@/lib/privacy/meta-attribution-consent", () => ({ metaConsentMetadataFromRequest: () => ({}) }));
vi.mock("@sentry/nextjs", () => ({ captureException: m.captureException, captureMessage: vi.fn() }));
vi.mock("@/lib/logger", () => ({
    logger: { error: m.error, warn: m.warn, info: m.info },
    createRequestLogger: () => ({ logger: { error: m.error, warn: m.warn, info: m.info }, requestId: "req-1" }),
}));

import { handleBillingCheckout } from "@/services/stripe/checkout-api";

const request = () => new Request("https://app.example.test/api/billing/checkout", {
    method: "POST", body: JSON.stringify({ priceId: "price_pro", source: "billing" }),
});
const stripeError = (type: string, code?: string, statusCode = 500) =>
    Object.assign(new Error(`${type} ${code ?? ""}`), { type, code, statusCode });
const sub = (status: string) => ({ id: "sub_old", status, items: { data: [{ id: "si_1", price: { id: "price_starter" } }] } });

beforeEach(() => {
    vi.resetAllMocks();
    m.getUser.mockResolvedValue({ data: { user: { id: "user-1", email: "owner@example.test" } } });
    m.member.mockResolvedValue({ kind: "ok", admin: {}, member: { organization_id: "org-1", role: "owner",
        organizations: { name: "Org", stripe_customer_id: "cus_1", stripe_subscription_id: "sub_old", referred_by_user_id: null } } });
    m.createSession.mockResolvedValue({ url: "https://checkout.stripe.com/c/new" });
    m.retrieve.mockResolvedValue(sub("active"));
    m.update.mockResolvedValue({});
    m.cancel.mockResolvedValue({});
});

describe("POST /api/billing/checkout with an existing subscription", () => {
    it("switches the live subscription in place without a new checkout", async () => {
        const res = await handleBillingCheckout(request());
        expect(res.status).toBe(200);
        expect((await res.json()).data).toMatchObject({ switched: true });
        expect(m.update).toHaveBeenCalledWith("sub_old", expect.objectContaining({ items: [{ id: "si_1", price: "price_pro" }] }));
        expect(m.createSession).not.toHaveBeenCalled();
    });

    it.each([
        ["a Stripe 5xx on retrieve", "retrieve", stripeError("StripeAPIError")],
        ["a rate limit on retrieve", "retrieve", stripeError("StripeRateLimitError", "rate_limit", 429)],
        ["a Stripe 5xx on update", "update", stripeError("StripeAPIError")],
        ["a missing price on update", "update", stripeError("StripeInvalidRequestError", "resource_missing", 404)],
    ])("returns 503 and creates no second checkout after %s", async (_label, call, error) => {
        (call === "retrieve" ? m.retrieve : m.update).mockRejectedValue(error);
        const res = await handleBillingCheckout(request());
        expect(res.status).toBe(503);
        expect(await res.json()).toMatchObject({ success: false, code: "plan_switch_failed", details: "req-1" });
        expect(m.createSession).not.toHaveBeenCalled();
        expect(m.error).toHaveBeenCalled();
        expect(m.captureException).toHaveBeenCalledWith(error, expect.anything());
    });

    it("returns 402 when ending a trial for an upgrade is declined by the card", async () => {
        m.retrieve.mockResolvedValue(sub("trialing"));
        m.update.mockRejectedValue(stripeError("StripeCardError", "card_declined", 402));
        const res = await handleBillingCheckout(request());
        expect(m.update.mock.calls[0][1]).toMatchObject({ trial_end: "now" });
        expect(res.status).toBe(402);
        expect(await res.json()).toMatchObject({ code: "plan_switch_payment_failed" });
        expect(m.createSession).not.toHaveBeenCalled();
    });

    it.each(["incomplete", "paused"])("refuses a second checkout while the subscription is %s", async (status) => {
        m.retrieve.mockResolvedValue(sub(status));
        const res = await handleBillingCheckout(request());
        expect(res.status).toBe(409);
        expect(m.update).not.toHaveBeenCalled();
        expect(m.createSession).not.toHaveBeenCalled();
    });

    it("starts a new checkout when Stripe says the stored subscription no longer exists", async () => {
        m.retrieve.mockRejectedValue(stripeError("StripeInvalidRequestError", "resource_missing", 404));
        const res = await handleBillingCheckout(request());
        expect(res.status).toBe(200);
        expect((await res.json()).data).toMatchObject({ url: "https://checkout.stripe.com/c/new" });
        expect(m.createSession).toHaveBeenCalledTimes(1);
    });

    it.each(["canceled", "incomplete_expired"])("starts a new checkout when the old subscription is %s", async (status) => {
        m.retrieve.mockResolvedValue(sub(status));
        const res = await handleBillingCheckout(request());
        expect(res.status).toBe(200);
        expect(m.update).not.toHaveBeenCalled();
        expect(m.cancel).not.toHaveBeenCalled();
        expect(m.createSession).toHaveBeenCalledTimes(1);
    });

    it("treats an unpaid subscription as gone without cancelling it before checkout", async () => {
        // Cancelling here would mail a cancellation/win-back to a buyer and lose the old
        // subscription if Checkout is abandoned; the checkout webhook cancels it after binding.
        m.retrieve.mockResolvedValue(sub("unpaid"));
        const res = await handleBillingCheckout(request());
        expect(res.status).toBe(200);
        expect(m.update).not.toHaveBeenCalled();
        expect(m.cancel).not.toHaveBeenCalled();
        expect(m.createSession).toHaveBeenCalledTimes(1);
    });
});
