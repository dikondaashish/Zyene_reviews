import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ user: vi.fn(), membership: vi.fn(), invoices: vi.fn() }));
vi.mock("@/lib/db/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: mocks.user } }),
}));
vi.mock("@/lib/billing/active-billing-member", () => ({ loadActiveBillingMember: mocks.membership }));
vi.mock("@/services/stripe/client", () => ({ stripe: { invoices: { list: mocks.invoices } } }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));

import { handleBillingInvoices } from "@/services/stripe/invoices-api";

const member = (role = "owner", customerId: string | null = "cus_active") => ({
  kind: "ok", member: {
    organization_id: "org-active", role,
    organizations: { id: "org-active", stripe_customer_id: customerId },
  },
});
const invoice = (overrides = {}) => ({
  id: "in_newest", number: "ZYENE-0001", customer: "cus_active", status: "paid",
  created: 1790812800, total: 2999, amount_paid: 2999, amount_remaining: 0, currency: "usd",
  invoice_pdf: "https://pay.stripe.com/invoice/example/pdf",
  hosted_invoice_url: "https://invoice.stripe.com/i/example",
  customer_email: "private@example.com", metadata: { secret: "hidden" }, ...overrides,
});
const request = (query = "") => new Request(`https://app.example.com/api/billing/invoices${query}`);

describe("billing invoice history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.user.mockResolvedValue({ data: { user: { id: "user-owner" } } });
    mocks.membership.mockResolvedValue(member());
    mocks.invoices.mockResolvedValue({ data: [invoice()], has_more: false });
  });

  it("returns invoice downloads only for the verified active organization", async () => {
    const res = await handleBillingInvoices(request());
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(mocks.membership).toHaveBeenCalledWith("user-owner");
    expect(mocks.invoices).toHaveBeenCalledWith({ customer: "cus_active", limit: 100 });
    expect(body.data).toEqual({ organizationId: "org-active", nextCursor: null, invoices: [{
      id: "in_newest", number: "ZYENE-0001", createdAt: "2026-10-01T00:00:00.000Z",
      amount: "$29.99", status: "paid", isFreeTrial: false, pdfUrl: "https://pay.stripe.com/invoice/example/pdf",
      hostedUrl: "https://invoice.stripe.com/i/example",
      receiptUrl: "https://invoice.stripe.com/i/example", paymentUrl: null,
    }] });
    expect(JSON.stringify(body)).not.toContain("private@example.com");
    expect(JSON.stringify(body)).not.toContain("hidden");
    expect(res.headers.get("cache-control")).toContain("no-store");
  });

  it("requires authentication before membership or provider calls", async () => {
    mocks.user.mockResolvedValue({ data: { user: null } });
    expect((await handleBillingInvoices(request())).status).toBe(401);
    expect(mocks.membership).not.toHaveBeenCalled();
    expect(mocks.invoices).not.toHaveBeenCalled();
  });

  it("offers payment for a remaining balance, including partial and one-cent balances", async () => {
    mocks.invoices.mockResolvedValue({ data: [
      invoice({ id: "in_partial", status: "open", amount_paid: 1000, amount_remaining: 1999 }),
      invoice({ id: "in_cent", status: "open", total: 1, amount_paid: 0, amount_remaining: 1 }),
    ], has_more: false });
    const body = await (await handleBillingInvoices(request())).json();
    expect(body.data.invoices).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "in_partial", receiptUrl: null, paymentUrl: "https://invoice.stripe.com/i/example" }),
      expect.objectContaining({ id: "in_cent", receiptUrl: null, paymentUrl: "https://invoice.stripe.com/i/example" }),
    ]));
  });

  it.each(["paid", "draft", "void", "uncollectible"])("does not offer payment for %s invoices", async status => {
    mocks.invoices.mockResolvedValue({ data: [invoice({ status, amount_remaining: 2999 })], has_more: false });
    const body = await (await handleBillingInvoices(request())).json();
    expect(body.data.invoices[0].paymentUrl).toBeNull();
  });

  it.each([
    { status: "open", amount_remaining: 0 },
    { status: "open", hosted_invoice_url: null, amount_remaining: 2999 },
    { status: "paid", amount_paid: 0 },
  ])("does not invent a receipt or payment action when unavailable: %o", async overrides => {
    mocks.invoices.mockResolvedValue({ data: [invoice(overrides)], has_more: false });
    const body = await (await handleBillingInvoices(request())).json();
    expect(body.data.invoices[0]).toMatchObject({ receiptUrl: null, paymentUrl: null });
  });

  it.each(["viewer", "member", "admin", "ORG_EMPLOYEE"])("denies %s before reading invoices", async role => {
    mocks.membership.mockResolvedValue(member(role));
    expect((await handleBillingInvoices(request())).status).toBe(403);
    expect(mocks.invoices).not.toHaveBeenCalled();
  });

  it.each([{ kind: "no-active-organization" }, { kind: "ok", member: null }])(
    "denies missing or revoked membership", async result => {
      mocks.membership.mockResolvedValue(result);
      expect((await handleBillingInvoices(request())).status).toBe(404);
      expect(mocks.invoices).not.toHaveBeenCalled();
    },
  );

  it("rejects inconsistent organization bindings", async () => {
    const result = member();
    result.member.organizations.id = "org-foreign";
    mocks.membership.mockResolvedValue(result);
    expect((await handleBillingInvoices(request())).status).toBe(404);
    expect(mocks.invoices).not.toHaveBeenCalled();
  });

  it.each(["?customer=cus_foreign", "?organization_id=org-foreign", "?starting_after=bad-id", "?starting_after=in_newest:invalid"])(
    "rejects untrusted scope or malformed pagination: %s", async query => {
      expect((await handleBillingInvoices(request(query))).status).toBe(400);
      expect(mocks.invoices).not.toHaveBeenCalled();
    },
  );

  it("returns an empty history without calling Stripe when there is no customer", async () => {
    mocks.membership.mockResolvedValue(member("owner", null));
    expect((await (await handleBillingInvoices(request())).json()).data.invoices).toEqual([]);
    expect(mocks.invoices).not.toHaveBeenCalled();
  });

  it("keeps older invoice pages scoped to the same customer", async () => {
    mocks.invoices.mockResolvedValue({ data: Array.from({ length: 10 }, (_, i) => invoice({ id: `in_older${i}` })), has_more: true });
    const body = await (await handleBillingInvoices(request("?starting_after=in_newest"))).json();
    expect(mocks.invoices).toHaveBeenCalledWith({ customer: "cus_active", limit: 100, starting_after: "in_newest" });
    expect(body.data.nextCursor).toBe("in_older9");
  });

  it("accepts trial display state in the cursor while deriving customer scope from membership", async () => {
    mocks.invoices.mockResolvedValue({ data: [invoice({ id: "in_older" })], has_more: false });
    const res = await handleBillingInvoices(request("?starting_after=in_newest%3Atrial"));
    expect(res.status).toBe(200);
    expect(mocks.invoices).toHaveBeenCalledWith({ customer: "cus_active", limit: 100, starting_after: "in_newest" });
  });

  it("never exposes an invoice from another Stripe customer", async () => {
    mocks.invoices.mockResolvedValue({ data: [invoice({ customer: "cus_foreign" })], has_more: false });
    const res = await handleBillingInvoices(request());
    expect(res.status).toBe(500);
    expect(await res.text()).not.toContain("pay.stripe.com");
  });

  it.each(["javascript:alert(1)", "not-a-url"])("does not render untrusted download destinations: %s", async pdfUrl => {
    mocks.invoices.mockResolvedValue({ data: [invoice({ invoice_pdf: pdfUrl, hosted_invoice_url: "https://stripe.com.evil.example/invoice" })], has_more: false });
    const body = await (await handleBillingInvoices(request())).json();
    expect(body.data.invoices[0]).toMatchObject({ pdfUrl: null, hostedUrl: null, receiptUrl: null, paymentUrl: null });
  });

  it("formats zero-decimal currencies and invoices without a PDF", async () => {
    mocks.invoices.mockResolvedValue({ data: [invoice({ currency: "jpy", total: 3000, status: "open", invoice_pdf: null })], has_more: false });
    const body = await (await handleBillingInvoices(request())).json();
    expect(body.data.invoices[0]).toMatchObject({ amount: "¥3,000", status: "open", pdfUrl: null });
  });

  it.each(["membership", "invoices"] as const)("fails closed on %s errors without leaking details", async target => {
    mocks[target].mockRejectedValue(new Error("Private provider details"));
    const res = await handleBillingInvoices(request());
    expect(res.status).toBe(500);
    expect(await res.text()).not.toContain("Private provider details");
    if (target === "membership") expect(mocks.invoices).not.toHaveBeenCalled();
  });
});
