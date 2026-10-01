import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { focusManager, InfiniteQueryObserver, QueryClient, type InfiniteData, type InfiniteQueryObserverOptions } from "@tanstack/react-query";
import type { BillingInvoicesPage } from "@/types/billing-invoices";

type InvoiceOptions = InfiniteQueryObserverOptions<BillingInvoicesPage, Error, InfiniteData<BillingInvoicesPage, string | null>, readonly string[], string | null>;
const mocks = vi.hoisted(() => ({ useQuery: vi.fn<(options: InvoiceOptions) => void>(), fetch: vi.fn() }));
vi.mock("@tanstack/react-query", async importOriginal => ({
    ...await importOriginal<typeof import("@tanstack/react-query")>(), useInfiniteQuery: mocks.useQuery,
}));
vi.mock("@/lib/billing/fetch-invoices", () => ({ fetchBillingInvoices: mocks.fetch }));
import { useBillingInvoices } from "@/components/settings/use-billing-invoices";

function InvoiceQueryProbe() {
    useBillingInvoices("org-active", true);
    return null;
}

const page = (status: "open" | "paid"): BillingInvoicesPage => ({
    organizationId: "org-active", nextCursor: null, invoices: [{
        id: "in_example", number: null, amount: "$29.99", createdAt: "2026-10-01T00:00:00.000Z",
        status, isFreeTrial: false, pdfUrl: null, hostedUrl: null, receiptUrl: null, paymentUrl: null,
    }],
});

describe("invoice history after paying in Stripe", () => {
    let client: QueryClient;
    let unsubscribe = () => {};
    beforeEach(() => { vi.clearAllMocks(); client = new QueryClient(); client.mount(); });
    afterEach(() => { unsubscribe(); client.unmount(); client.clear(); focusManager.setFocused(undefined); });

    const observe = () => {
        renderToStaticMarkup(createElement(InvoiceQueryProbe));
        const options = mocks.useQuery.mock.calls.at(-1)?.[0];
        if (!options) throw new Error("Missing invoice query options");
        const observer = new InfiniteQueryObserver(client, options);
        unsubscribe = observer.subscribe(() => {});
        return observer;
    };

    it("refreshes recently cached pending invoices when the customer returns from Stripe", async () => {
        client.setQueryData(["billing-invoices", "org-active"], { pages: [page("open")], pageParams: [null] });
        mocks.fetch.mockResolvedValue(page("paid"));
        const observer = observe();
        await vi.waitFor(() => expect(observer.getCurrentResult().isFetching).toBe(false));
        client.setQueryData(["billing-invoices", "org-active"], { pages: [page("open")], pageParams: [null] });
        expect(observer.getCurrentResult().data?.pages[0].invoices[0].status).toBe("open");
        mocks.fetch.mockClear();
        focusManager.setFocused(false);
        focusManager.setFocused(true);
        await vi.waitFor(() => expect(mocks.fetch).toHaveBeenCalledOnce());
        await vi.waitFor(() => expect(observer.getCurrentResult().data?.pages[0].invoices[0].status).toBe("paid"));
    });

    it("refreshes a recent pending invoice when the popup is reopened", async () => {
        client.setQueryData(["billing-invoices", "org-active"], { pages: [page("open")], pageParams: [null] });
        mocks.fetch.mockResolvedValue(page("paid"));
        const observer = observe();
        await vi.waitFor(() => expect(observer.getCurrentResult().data?.pages[0].invoices[0].status).toBe("paid"));
        expect(mocks.fetch).toHaveBeenCalledOnce();
    });
});
