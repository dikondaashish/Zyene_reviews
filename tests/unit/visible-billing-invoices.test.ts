import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ invoices: vi.fn(), subscription: vi.fn(), charges: vi.fn() }));
vi.mock("@/services/stripe/client", () => ({ stripe: {
  invoices: { list: mocks.invoices }, subscriptions: { retrieve: mocks.subscription },
  charges: { list: mocks.charges },
} }));
import { loadVisibleBillingInvoices } from "@/services/stripe/visible-invoices";

const invoice = (id: string, total = 2999, overrides = {}) => ({
  id, number: id, customer: "cus_active", status: "paid", created: 1790812800,
  total, amount_paid: total, currency: "usd", billing_reason: "manual", parent: null,
  lines: { data: [] }, invoice_pdf: null, hosted_invoice_url: null, ...overrides,
});
const trial = (id = "in_trial", overrides = {}) => invoice(id, 0, {
  billing_reason: "subscription_create",
  parent: { type: "subscription_details", subscription_details: { subscription: {
    id: "sub_trial", customer: "cus_active", trial_start: 100, trial_end: 200,
  } } },
  lines: { data: [{ amount: 0, period: { start: 100, end: 200 },
    parent: { type: "subscription_item_details", subscription_item_details: { subscription: "sub_trial" } } }] },
  ...overrides,
});
const page = (data: ReturnType<typeof invoice>[], hasMore = false) => ({ data, has_more: hasMore });

describe("visible billing invoices", () => {
  beforeEach(() => vi.resetAllMocks());

  it("removes the 13 empty invoices while retaining all paid invoices and the free trial", async () => {
    mocks.invoices.mockResolvedValue(page([
      ...Array.from({ length: 13 }, (_, i) => invoice(`in_empty${i}`, 0)),
      invoice("in_sep"), invoice("in_aug"), invoice("in_jul"), trial(),
    ]));
    const result = await loadVisibleBillingInvoices("cus_active");
    expect(result.invoices.map(i => i.id)).toEqual(["in_sep", "in_aug", "in_jul", "in_trial"]);
    expect(result.invoices.at(-1)).toMatchObject({ amount: "$0.00", isFreeTrial: true });
    expect(result.nextCursor).toBeNull();
  });

  it("keeps a one-cent invoice, including unpaid and voided invoices", async () => {
    mocks.invoices.mockResolvedValue(page([
      invoice("in_cent", 1), invoice("in_open", 1, { status: "open" }),
      invoice("in_void", 1, { status: "void" }), invoice("in_credit", -1),
    ]));
    const result = await loadVisibleBillingInvoices("cus_active");
    expect(result.invoices.map(i => [i.id, i.amount])).toEqual([
      ["in_cent", "$0.01"], ["in_open", "$0.01"], ["in_void", "$0.01"],
    ]);
  });

  it("does not mistake an empty subscription invoice or a fully discounted bill for a trial", async () => {
    mocks.invoices.mockResolvedValue(page([
      trial("in_empty", { lines: { data: [] } }),
      trial("in_coupon", { parent: { type: "subscription_details", subscription_details: { subscription: {
        id: "sub_trial", customer: "cus_active", trial_start: null, trial_end: null,
      } } } }),
      trial("in_outside", { lines: { data: [{ amount: 0, period: { start: 200, end: 300 },
        parent: { type: "subscription_item_details", subscription_item_details: { subscription: "sub_trial" } } }] } }),
    ]));
    expect((await loadVisibleBillingInvoices("cus_active")).invoices).toEqual([]);
  });

  it("verifies a genuine trial through the subscription retrieval API", async () => {
    mocks.invoices.mockResolvedValue(page([trial("in_trial", { parent: {
      type: "subscription_details", subscription_details: { subscription: "sub_trial" },
    } })]));
    mocks.subscription.mockResolvedValue({ id: "sub_trial", customer: "cus_active", trial_start: 100, trial_end: 200 });
    expect((await loadVisibleBillingInvoices("cus_active")).invoices[0].isFreeTrial).toBe(true);
    expect(mocks.subscription).toHaveBeenCalledWith("sub_trial");
    expect(mocks.invoices).toHaveBeenCalledWith({ customer: "cus_active", limit: 100, expand: ["data.payments"] });
  });

  it("retains the original trial invoice when an upgrade ended the trial early", async () => {
    mocks.invoices.mockResolvedValue(page([trial("in_trial", {
      parent: { type: "subscription_details", subscription_details: { subscription: "sub_trial" } },
      lines: { data: [{ amount: 0, description: "Free trial for 1 × Zyene Starter", period: { start: 100, end: 200 },
        parent: { type: "subscription_item_details", subscription_item_details: { subscription: "sub_trial" } } }] },
    })]));
    mocks.subscription.mockResolvedValue({ id: "sub_trial", customer: "cus_active", trial_start: 100, trial_end: 150 });
    expect((await loadVisibleBillingInvoices("cus_active")).invoices[0]?.isFreeTrial).toBe(true);
  });

  it("does not read subscriptions for empty AEO invoices or positive totals", async () => {
    mocks.invoices.mockResolvedValue(page([invoice("in_empty", 0), invoice("in_paid")]));
    await loadVisibleBillingInvoices("cus_active");
    expect(mocks.subscription).not.toHaveBeenCalled();
  });

  it("fails closed when trial verification fails", () => {
    mocks.invoices.mockResolvedValue(page([trial("in_trial", { parent: {
      type: "subscription_details", subscription_details: { subscription: "sub_trial" },
    } })]));
    mocks.subscription.mockRejectedValue(new Error("Trial verification failed"));
    return expect(loadVisibleBillingInvoices("cus_active")).rejects.toThrow("Trial verification failed");
  });

  it("retains only one trial across older pages and never skips a paid invoice", async () => {
    const raw = [trial("in_firstTrial"), ...Array.from({ length: 10 }, (_, i) => invoice(`in_paid${i}`)), trial("in_oldTrial")];
    mocks.invoices.mockResolvedValueOnce(page(raw));
    const first = await loadVisibleBillingInvoices("cus_active");
    expect(first.invoices).toHaveLength(10);
    expect(first.nextCursor).toBe("in_paid8:trial");
    mocks.invoices.mockResolvedValueOnce(page(raw.slice(10)));
    const second = await loadVisibleBillingInvoices("cus_active", first.nextCursor!);
    expect(second.invoices.map(i => i.id)).toEqual(["in_paid9"]);
    expect(second.nextCursor).toBeNull();
    expect(mocks.invoices.mock.calls[1][0]).toMatchObject({ customer: "cus_active", starting_after: "in_paid8" });
  });

  it("continues through zero-only Stripe pages to fill the visible history", async () => {
    mocks.invoices.mockResolvedValueOnce(page([invoice("in_empty", 0)], true));
    mocks.invoices.mockResolvedValueOnce(page([invoice("in_paid"), trial()]));
    const result = await loadVisibleBillingInvoices("cus_active");
    expect(result.invoices.map(i => i.id)).toEqual(["in_paid", "in_trial"]);
    expect(result.nextCursor).toBeNull();
  });

  it("bounds provider work and leaves a usable cursor when several pages contain only zero invoices", async () => {
    for (let i = 0; i < 3; i++) mocks.invoices.mockResolvedValueOnce(page([invoice(`in_empty${i}`, 0)], true));
    const result = await loadVisibleBillingInvoices("cus_active");
    expect(mocks.invoices).toHaveBeenCalledTimes(3);
    expect(result).toEqual({ invoices: [], nextCursor: "in_empty2" });
  });

  it.each([false, true])("checks the customer binding even for filtered invoices (zero: %s)", zero => {
    mocks.invoices.mockResolvedValue(page([invoice("in_foreign", zero ? 0 : 1, { customer: "cus_foreign" })]));
    return expect(loadVisibleBillingInvoices("cus_active")).rejects.toThrow("customer binding");
  });

  it("rejects a foreign subscription attached to a purported trial", () => {
    mocks.invoices.mockResolvedValue(page([trial("in_trial", { parent: { type: "subscription_details", subscription_details: {
      subscription: { id: "sub_trial", customer: "cus_foreign", trial_start: 100, trial_end: 200 },
    } } })]));
    return expect(loadVisibleBillingInvoices("cus_active")).rejects.toThrow("customer binding");
  });

  describe("refunds", () => {
    const paidBy = (pi: string) => ({ payments: { data: [{ payment: { type: "payment_intent", payment_intent: pi } }] } });
    const charge = (id: string, pi: string, amount_refunded: number, customer = "cus_active") =>
      ({ id, payment_intent: pi, amount_refunded, customer });
    const charges = (data: ReturnType<typeof charge>[]) =>
      mocks.charges.mockReturnValue({ autoPagingToArray: vi.fn().mockResolvedValue(data) });

    it("shows the partially refunded overcharge with its refunded and net amounts", async () => {
      mocks.invoices.mockResolvedValue(page([
        invoice("in_oct", 5499, paidBy("pi_oct")), invoice("in_sep", 2999, { created: 1788134400, ...paidBy("pi_sep") }),
      ]));
      charges([charge("ch_oct", "pi_oct", 2500), charge("ch_sep", "pi_sep", 0)]);
      const [oct, sep] = (await loadVisibleBillingInvoices("cus_active")).invoices;
      expect(oct).toMatchObject({ amount: "$54.99", status: "paid", refundStatus: "partial",
        refundedAmount: "$25.00", netAmount: "$29.99" });
      expect(sep).toMatchObject({ refundStatus: "none", refundedAmount: null, netAmount: null });
      expect(mocks.charges).toHaveBeenCalledTimes(1);
      expect(mocks.charges).toHaveBeenCalledWith({ customer: "cus_active", created: { gte: 1788134400 }, limit: 100 });
    });

    it("marks a fully refunded invoice and keeps its receipt", async () => {
      mocks.invoices.mockResolvedValue(page([invoice("in_full", 2999, {
        hosted_invoice_url: "https://invoice.stripe.com/i/x", payments: { data: [{ payment: { type: "charge", charge: "ch_full" } }] },
      })]));
      charges([charge("ch_full", "pi_other", 2999)]);
      expect((await loadVisibleBillingInvoices("cus_active")).invoices[0]).toMatchObject({
        refundStatus: "full", refundedAmount: "$29.99", netAmount: "$0.00", receiptUrl: "https://invoice.stripe.com/i/x",
      });
    });

    it("skips the charge lookup when nothing on the page was paid", async () => {
      mocks.invoices.mockResolvedValue(page([invoice("in_open", 2999, { status: "open", amount_paid: 0, ...paidBy("pi_open") })]));
      await loadVisibleBillingInvoices("cus_active");
      expect(mocks.charges).not.toHaveBeenCalled();
    });

    it("rejects a refunded charge bound to another customer", () => {
      mocks.invoices.mockResolvedValue(page([invoice("in_oct", 5499, paidBy("pi_oct"))]));
      charges([charge("ch_oct", "pi_oct", 2500, "cus_foreign")]);
      return expect(loadVisibleBillingInvoices("cus_active")).rejects.toThrow("customer binding");
    });
  });
});
