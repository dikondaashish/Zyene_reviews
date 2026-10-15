import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ getUser: vi.fn(), member: vi.fn(), createSession: vi.fn() }));
vi.mock("@/lib/db/supabase/server", () => ({ createClient: async () => ({ auth: { getUser: m.getUser } }) }));
vi.mock("@/lib/billing/active-billing-member", () => ({ loadActiveBillingMember: m.member }));
vi.mock("@/services/stripe/client", () => ({ stripe: { checkout: { sessions: { create: m.createSession } } } }));
vi.mock("@/lib/logger", () => ({
    createRequestLogger: () => ({ logger: { error: vi.fn(), info: vi.fn() }, requestId: "req-1" }),
}));

import { handleAeoTopupCheckout } from "@/services/aeo/billing/topup-checkout-api";

const FLAG_KEY = "AEO_METERED_BILLING_LIVE";
const original = process.env[FLAG_KEY];
const request = (body: unknown) =>
    new Request("https://app.example.com/api/aeo/balance/checkout", { method: "POST", body: JSON.stringify(body) });
const owner = (stripeCustomerId: string | null = "cus_1") => ({
    kind: "ok",
    member: { organization_id: "org-1", role: "owner", organizations: { id: "org-1", stripe_customer_id: stripeCustomerId } },
});

beforeEach(() => {
    vi.resetAllMocks();
    process.env[FLAG_KEY] = "true";
    m.getUser.mockResolvedValue({ data: { user: { id: "user-1", email: "owner@example.com" } } });
    m.member.mockResolvedValue(owner());
    m.createSession.mockResolvedValue({ url: "https://checkout.stripe.com/c/1" });
});
afterEach(() => {
    if (original === undefined) delete process.env[FLAG_KEY];
    else process.env[FLAG_KEY] = original;
});

describe("POST /api/aeo/balance/checkout", () => {
    it("starts a card-only one-time checkout for the chosen amount", async () => {
        const res = await handleAeoTopupCheckout(request({ amountUsd: 25 }));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ success: true, data: { url: "https://checkout.stripe.com/c/1" } });

        const params = m.createSession.mock.calls[0][0];
        expect(params).toMatchObject({
            mode: "payment",
            payment_method_types: ["card"],
            customer: "cus_1",
            metadata: { kind: "aeo_credit_topup", organization_id: "org-1", user_id: "user-1", amount_usd: "25" },
            success_url: "https://app.example.com/google-seo-aeo?topup=success",
        });
        expect(params.line_items[0].price_data.unit_amount).toBe(2_500);
    });

    it("falls back to the user's email when the org has no Stripe customer yet", async () => {
        m.member.mockResolvedValue(owner(null));
        await handleAeoTopupCheckout(request({ amountUsd: 10 }));
        expect(m.createSession.mock.calls[0][0]).toMatchObject({ customer_email: "owner@example.com" });
        expect(m.createSession.mock.calls[0][0].customer).toBeUndefined();
    });

    it.each([9, 501, 12.5, "25"])("rejects an invalid amount %j", async (amountUsd) => {
        expect((await handleAeoTopupCheckout(request({ amountUsd }))).status).toBe(400);
        expect(m.createSession).not.toHaveBeenCalled();
    });

    it("lets only the organization owner pay", async () => {
        m.member.mockResolvedValue({ ...owner(), member: { ...owner().member, role: "member" } });
        expect((await handleAeoTopupCheckout(request({ amountUsd: 25 }))).status).toBe(403);
        expect(m.createSession).not.toHaveBeenCalled();
    });

    it("refuses while metered billing is off", async () => {
        delete process.env[FLAG_KEY];
        expect((await handleAeoTopupCheckout(request({ amountUsd: 25 }))).status).toBe(409);
    });

    it("requires a signed-in user", async () => {
        m.getUser.mockResolvedValue({ data: { user: null } });
        expect((await handleAeoTopupCheckout(request({ amountUsd: 25 }))).status).toBe(401);
    });
});
