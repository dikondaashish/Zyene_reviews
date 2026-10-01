import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BillingInvoiceRow } from "@/components/settings/billing-invoice-row";
import type { BillingInvoice } from "@/types/billing-invoices";

export function BillingInvoiceHistoryContent(props: {
    invoices: BillingInvoice[];
    loading: boolean;
    failed: boolean;
    hasMore: boolean;
    loadingMore: boolean;
    onRetry: () => void;
    onLoadMore: () => void;
}) {
    const { invoices, loading, failed, hasMore, loadingMore, onRetry, onLoadMore } = props;
    if (loading) return <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground" role="status">
        <Loader2 className="size-4 animate-spin" aria-hidden />Loading invoices…
    </p>;
    if (!failed && invoices.length === 0) return <div className="mt-5 rounded-lg bg-muted/60 p-4">
        <p className="text-sm font-medium">No invoices yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Your invoices will appear here once they are issued.</p>
    </div>;
    return <>
        <ul className="mt-3 divide-y divide-border" aria-label="Invoice history">
            {invoices.map((invoice) => <BillingInvoiceRow key={invoice.id} invoice={invoice} />)}
        </ul>
        {failed && <div className="mt-4 flex flex-wrap items-center gap-3" role="alert">
            <p className="text-sm text-muted-foreground">We couldn’t load your invoices.</p>
            <Button variant="outline" onClick={onRetry}>Try again</Button>
        </div>}
        {hasMore && !failed && <Button className="mt-4 min-h-11 w-full sm:w-auto" variant="outline"
            disabled={loadingMore} onClick={onLoadMore}>
            {loadingMore && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {loadingMore ? "Loading…" : "Load older invoices"}
        </Button>}
    </>;
}
