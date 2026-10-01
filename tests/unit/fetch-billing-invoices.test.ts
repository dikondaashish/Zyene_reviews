import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchBillingInvoices } from "@/lib/billing/fetch-invoices";

const response = (organizationId = "org-active") => ({
    success: true, data: { organizationId, invoices: [], nextCursor: null },
});

describe("invoice history fetching", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("uses a private request with the cancellation signal and older-page cursor", async () => {
        const fetchMock = vi.fn().mockResolvedValue(Response.json(response()));
        vi.stubGlobal("fetch", fetchMock);
        const signal = new AbortController().signal;
        await fetchBillingInvoices("org-active", "in_previous", signal);
        expect(fetchMock).toHaveBeenCalledWith("/api/billing/invoices?starting_after=in_previous", {
            credentials: "include", cache: "no-store", signal,
        });
    });

    it("preserves the free-trial display state in the older-page cursor", async () => {
        const fetchMock = vi.fn().mockResolvedValue(Response.json(response()));
        vi.stubGlobal("fetch", fetchMock);
        await fetchBillingInvoices("org-active", "in_previous:trial");
        expect(fetchMock.mock.calls[0][0]).toBe("/api/billing/invoices?starting_after=in_previous%3Atrial");
    });

    it("discards a response when the selected organization changed during the request", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(response("org-other"))));
        await expect(fetchBillingInvoices("org-active", null)).rejects.toThrow("organization changed");
    });

    it("keeps provider and authorization failure details out of the UI", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: "Private diagnostic" }, { status: 403 })));
        await expect(fetchBillingInvoices("org-active", null)).rejects.toThrow("Unable to load invoices");
    });

    it("rejects malformed invoice data rather than rendering an unsafe link", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ success: true, data: {
            organizationId: "org-active", nextCursor: null,
            invoices: [{ id: "in_bad", pdfUrl: "javascript:alert(1)" }],
        } })));
        await expect(fetchBillingInvoices("org-active", null)).rejects.toThrow();
    });
});
