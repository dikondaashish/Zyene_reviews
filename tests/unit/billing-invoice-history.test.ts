import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as content from "@/components/settings/billing-invoice-history-content";

const mocks = vi.hoisted(() => ({ history: vi.fn() }));
vi.mock("@/components/settings/use-billing-invoices", () => ({ useBillingInvoices: mocks.history }));
import { BillingInvoiceHistory } from "@/components/settings/billing-invoice-history";

const invoice = {
  id: "in_example", number: "ZYENE-0001", createdAt: "2026-10-01T00:00:00.000Z",
  amount: "$29.99", status: "paid", pdfUrl: "https://pay.stripe.com/invoice/example/pdf",
  hostedUrl: "https://invoice.stripe.com/i/example",
};
const render = (canManageBilling = true, hasStripeCustomer = true) => renderToStaticMarkup(
  createElement(BillingInvoiceHistory, { organizationId: "org-active", canManageBilling, hasStripeCustomer }),
);

describe("billing invoice history display", () => {
  afterEach(() => vi.restoreAllMocks());
  beforeEach(() => {
    mocks.history.mockReturnValue({
      data: { pages: [{ invoices: [invoice] }] }, isPending: false, isError: false,
      isFetchingNextPage: false, hasNextPage: false, fetchNextPage: vi.fn(), refetch: vi.fn(),
    });
  });

  it("shows invoice dates, totals, paid status, and a PDF download", () => {
    const html = render();
    expect(html).toContain("Invoices");
    expect(html).toContain("ZYENE-0001");
    expect(html).toContain("Oct 1, 2026");
    expect(html).toContain("$29.99");
    expect(html).toContain("Paid");
    expect(html).toContain('href="https://pay.stripe.com/invoice/example/pdf"');
    expect(html).toContain("Download PDF");
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("hides invoices when the user lacks billing permission", () => {
    expect(render(false)).toBe("");
  });

  it("shows a useful empty state when no billing account exists", () => {
    expect(render(true, false)).toContain("No invoices yet");
    expect(render(true, false)).not.toContain("ZYENE-0001");
  });

  it("does not offer a broken download when a PDF is unavailable", () => {
    mocks.history.mockReturnValue({ data: { pages: [{ invoices: [{ ...invoice, pdfUrl: null }] }] } });
    const html = render();
    expect(html).not.toContain("Download PDF");
    expect(html).toContain("View invoice");
  });

  it("offers older invoice pages", () => {
    mocks.history.mockReturnValue({ data: { pages: [{ invoices: [invoice] }] }, hasNextPage: true });
    expect(render()).toContain("Load older invoices");
  });

  it("labels the retained zero-dollar trial as Free trial", () => {
    mocks.history.mockReturnValue({ data: { pages: [{ invoices: [{ ...invoice, amount: "$0.00", isFreeTrial: true }] }] } });
    const html = render();
    expect(html).toContain("Free trial");
    expect(html).not.toContain(">Paid<");
  });

  it("keeps older history reachable when a bounded scan found only hidden invoices", () => {
    mocks.history.mockReturnValue({ data: { pages: [{ invoices: [] }] }, hasNextPage: true });
    expect(render()).toContain("Load older invoices");
    expect(render()).not.toContain("No invoices yet");
  });

  it("shows loading and retry states", () => {
    mocks.history.mockReturnValue({ isPending: true });
    expect(render()).toContain("Loading invoices");
    mocks.history.mockReturnValue({ isPending: false, isError: true });
    expect(render()).toContain("Try again");
  });

  it.each([false, true])("retries the request that failed when invoices are already visible (older page: %s)", olderPageFailed => {
    const fetchNextPage = vi.fn();
    const refetch = vi.fn();
    mocks.history.mockReturnValue({
      data: { pages: [{ invoices: [invoice] }] }, isError: true,
      isFetchNextPageError: olderPageFailed, fetchNextPage, refetch,
    });
    const renderedContent = vi.spyOn(content, "BillingInvoiceHistoryContent");
    render();
    renderedContent.mock.calls.at(-1)?.[0].onRetry();
    expect(olderPageFailed ? fetchNextPage : refetch).toHaveBeenCalledOnce();
    expect(olderPageFailed ? refetch : fetchNextPage).not.toHaveBeenCalled();
  });
});
