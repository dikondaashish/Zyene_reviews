import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() } }));

import { isValidTopupAmount, testsForAmount, formatUsd } from "@/lib/billing/aeo-topup-catalog";
import { loadAffordableTests, toAeoBalance } from "@/services/aeo/billing/aeo-balance";
import { fulfillAeoTopupCheckout, isAeoTopupCheckoutSession } from "@/services/aeo/billing/fulfill-topup-checkout";
import type { WebhookAdminClient } from "@/services/stripe/webhook-types";

const FLAG_KEY = "AEO_METERED_BILLING_LIVE";
const original = process.env[FLAG_KEY];
beforeEach(() => {
    delete process.env[FLAG_KEY];
});
afterEach(() => {
    if (original === undefined) delete process.env[FLAG_KEY];
    else process.env[FLAG_KEY] = original;
});

describe("top-up catalog", () => {
    it.each([10, 25, 50, 137, 500])("accepts whole-dollar $%d", (usd) => expect(isValidTopupAmount(usd)).toBe(true));
    it.each([0, 9, 501, 10.5, Number.NaN])("rejects %s", (usd) => expect(isValidTopupAmount(usd)).toBe(false));
    it("prices tests at $2.50", () => {
        expect(testsForAmount(10)).toBe(4);
        expect(testsForAmount(25)).toBe(10);
        expect(testsForAmount(11)).toBe(4);
    });
    it("formats whole and fractional dollars", () => {
        expect(formatUsd(5)).toBe("$5");
        expect(formatUsd(2.5)).toBe("$2.50");
    });
});

describe("prepaid balance", () => {
    it("adds plan credit and paid balance, and counts whole tests", () => {
        expect(
            toAeoBalance({ balance_micro_usd: 2_500_000, granted_micro_usd: 5_000_000, purchased_balance_micro_usd: 6_000_000 })
        ).toEqual({
            planMicroUsd: 2_500_000,
            planGrantedMicroUsd: 5_000_000,
            purchasedMicroUsd: 6_000_000,
            totalMicroUsd: 8_500_000,
            testsRemaining: 3,
        });
    });

    it("treats a missing row as $0, not an error", () => {
        expect(toAeoBalance(null).testsRemaining).toBe(0);
    });

    it("is unlimited (null) and reads nothing while metered billing is off", async () => {
        const from = vi.fn();
        expect(await loadAffordableTests({ from } as never, "org-1")).toBeNull();
        expect(from).not.toHaveBeenCalled();
    });

    it("returns the affordable test count while billing is live", async () => {
        process.env[FLAG_KEY] = "true";
        const row = { balance_micro_usd: 0, granted_micro_usd: 5_000_000, purchased_balance_micro_usd: 5_000_000 };
        const db = {
            from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: row, error: null }) }) }) }),
        };
        expect(await loadAffordableTests(db as never, "org-1")).toBe(2);
    });
});

describe("top-up webhook fulfillment", () => {
    const paid = {
        id: "cs_1",
        mode: "payment",
        payment_status: "paid",
        amount_total: 2_500,
        metadata: { kind: "aeo_credit_topup", organization_id: "org-1" },
    };
    const client = (result: { data: boolean | null; error: { message: string } | null }) => {
        const rpc = vi.fn().mockResolvedValue(result);
        return { rpc, supabase: { rpc } as unknown as WebhookAdminClient };
    };

    it("recognizes only top-up sessions", () => {
        expect(isAeoTopupCheckoutSession(paid)).toBe(true);
        expect(isAeoTopupCheckoutSession({ metadata: { kind: "nfc" } })).toBe(false);
    });

    it("credits what Stripe collected, converted to micro-USD", async () => {
        const { rpc, supabase } = client({ data: true, error: null });
        await fulfillAeoTopupCheckout(paid, supabase);
        expect(rpc).toHaveBeenCalledWith("aeo_apply_credit_topup", {
            p_organization_id: "org-1",
            p_checkout_session_id: "cs_1",
            p_amount_micro_usd: 25_000_000,
        });
    });

    it("credits nothing for an unpaid session", async () => {
        const { rpc, supabase } = client({ data: true, error: null });
        await fulfillAeoTopupCheckout({ ...paid, payment_status: "unpaid" }, supabase);
        expect(rpc).not.toHaveBeenCalled();
    });

    it("throws on missing data or a failed credit, so Stripe retries the webhook", async () => {
        const ok = client({ data: true, error: null });
        await expect(fulfillAeoTopupCheckout({ ...paid, metadata: { kind: "aeo_credit_topup" } }, ok.supabase)).rejects.toThrow();
        const failed = client({ data: null, error: { message: "boom" } });
        await expect(fulfillAeoTopupCheckout(paid, failed.supabase)).rejects.toThrow("boom");
    });
});
