"use client";

import { FileText } from "lucide-react";
import { BillingInvoiceHistoryContent } from "@/components/settings/billing-invoice-history-content";
import { useBillingInvoices } from "@/components/settings/use-billing-invoices";

export function BillingInvoiceHistory(props: {
    organizationId: string;
    canManageBilling: boolean;
    hasStripeCustomer: boolean;
}) {
    const { organizationId, canManageBilling, hasStripeCustomer } = props;
    const history = useBillingInvoices(organizationId, canManageBilling && hasStripeCustomer);
    if (!canManageBilling) return null;
    const invoices = hasStripeCustomer ? history.data?.pages.flatMap((page) => page.invoices) ?? [] : [];
    const loading = hasStripeCustomer && history.isPending;
    const failed = hasStripeCustomer && history.isError;

    return (
        <section className="rounded-xl border border-border bg-card p-5 sm:p-6" aria-labelledby="billing-invoices-title">
            <h2 id="billing-invoices-title" className="flex items-center gap-2 text-base font-semibold">
                <FileText className="size-4 text-muted-foreground" aria-hidden />Invoices
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">View your billing history and download invoice PDFs.</p>
            <BillingInvoiceHistoryContent invoices={invoices} loading={loading} failed={failed}
                hasMore={hasStripeCustomer && !!history.hasNextPage} loadingMore={history.isFetchingNextPage}
                onRetry={() => void (history.isFetchNextPageError ? history.fetchNextPage() : history.refetch())}
                onLoadMore={() => void history.fetchNextPage()} />
        </section>
    );
}
