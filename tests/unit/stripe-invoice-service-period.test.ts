import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ live: vi.fn(), lines: vi.fn(), plan: vi.fn() }));
vi.mock("@/lib/features/aeo-surfaces", () => ({ isMeteredBillingLive: m.live }));
vi.mock("@/services/stripe/client", () => ({ stripe: { invoices: { listLineItems: m.lines } } }));
vi.mock("@/services/stripe/plans", () => ({ getPlanByPriceId: m.plan }));
import { invoiceServicePeriodEnd } from "@/services/stripe/invoice-service-period";
const line = (subscription = "sub_a", proration = false, price = "price_plan") => ({
    parent: { subscription_item_details: { subscription, proration } },
    pricing: { price_details: { price } }, period: { start: 100, end: 200 },
});
const invoice = (data: unknown[], more = false) => ({ id: "in_a", period_end: 100, lines: { data, has_more: more } }) as unknown as Stripe.Invoice;
beforeEach(() => { vi.resetAllMocks(); m.live.mockReturnValue(true); m.plan.mockImplementation((p) => p === "price_plan" ? { id: "starter" } : null); });
describe("Stripe renewal service period", () => {
    it("uses the paid plan line's forward service period, not invoice usage period", async () => {
        expect(await invoiceServicePeriodEnd(invoice([line()]), "sub_a", "starter")).toBe(200);
    });
    it.each([line("foreign"), line("sub_a", true), line("sub_a", false, "price_other")])
        ("does not grant against a foreign, prorated or non-plan line", async (item) => {
            expect(await invoiceServicePeriodEnd(invoice([item]), "sub_a", "starter")).toBeUndefined();
        });
    it("retrieves bounded complete lines when the payload is truncated", async () => {
        const toArray = vi.fn().mockResolvedValue([line()]); m.lines.mockReturnValue({ autoPagingToArray: toArray });
        expect(await invoiceServicePeriodEnd(invoice([], true), "sub_a", "starter")).toBe(200);
        expect(toArray).toHaveBeenCalledWith({ limit: 1000 });
    });
    it("does no provider work while metered billing is disabled", async () => {
        m.live.mockReturnValue(false);
        expect(await invoiceServicePeriodEnd(invoice([], true), "sub_a", "starter")).toBeUndefined();
        expect(m.lines).not.toHaveBeenCalled();
    });
});
