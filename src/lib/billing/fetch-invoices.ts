import { billingInvoicesResponseSchema } from "@/types/billing-invoices";

export async function fetchBillingInvoices(organizationId: string, cursor: string | null, signal?: AbortSignal) {
    const query = cursor ? `?starting_after=${encodeURIComponent(cursor)}` : "";
    const response = await fetch(`/api/billing/invoices${query}`, {
        credentials: "include", cache: "no-store", signal,
    });
    if (!response.ok) throw new Error("Unable to load invoices. Please try again.");
    const result = billingInvoicesResponseSchema.parse(await response.json());
    if (result.data.organizationId !== organizationId) throw new Error("The active organization changed. Refresh to load invoices.");
    return result.data;
}
