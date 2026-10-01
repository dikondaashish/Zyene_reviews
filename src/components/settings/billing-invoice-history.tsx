"use client";

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
        <BillingInvoiceHistoryContent invoices={invoices} loading={loading} failed={failed}
            hasMore={hasStripeCustomer && !!history.hasNextPage} loadingMore={history.isFetchingNextPage}
            onRetry={() => void (history.isFetchNextPageError ? history.fetchNextPage() : history.refetch())}
            onLoadMore={() => void history.fetchNextPage()} />
    );
}
