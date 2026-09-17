import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ retrieve: vi.fn(), preview: vi.fn() }));
vi.mock("@/services/stripe/client", () => ({ stripe: { subscriptions: { retrieve: mocks.retrieve }, invoices: { createPreview: mocks.preview } } }));
vi.mock("@/lib/logger", () => ({ logger: { warn: vi.fn() } }));
import { loadBillingRenewalSummary } from "@/services/stripe/billing-renewal-summary";
beforeEach(() => {
    vi.resetAllMocks();
    mocks.retrieve.mockResolvedValue({ status: "active", trial_end: 1700000000, cancel_at_period_end: false, items: { data: [{ current_period_end: 1900000000 }] } });
    mocks.preview.mockResolvedValue({ currency: "usd", amount_due: 4900 });
});
it("shows the next billing period after a past trial, with the read-only invoice estimate", async () => {
    expect(await loadBillingRenewalSummary("sub_example")).toEqual({ renewalAt: new Date(1900000000000).toISOString(), amount: "$49.00", canceled: false });
    expect(mocks.preview).toHaveBeenCalledWith({ subscription: "sub_example" });
});
it("uses the trial end while trialing and does not preview a canceled renewal", async () => {
    mocks.retrieve.mockResolvedValue({ status: "trialing", trial_end: 1800000000, cancel_at_period_end: true, items: { data: [] } });
    expect(await loadBillingRenewalSummary("sub_example")).toEqual({ renewalAt: new Date(1800000000000).toISOString(), amount: null, canceled: true });
    expect(mocks.preview).not.toHaveBeenCalled();
});
it("leaves unavailable billing details unknown", async () => {
    mocks.retrieve.mockRejectedValue(new Error("Stripe unavailable"));
    expect(await loadBillingRenewalSummary("sub_example")).toBeNull();
    expect(await loadBillingRenewalSummary(null)).toBeNull();
});
