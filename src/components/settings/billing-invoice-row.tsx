import { Badge } from "@/components/ui/badge";
import { BillingInvoiceActions } from "@/components/settings/billing-invoice-actions";
import { cn } from "@/lib/utils";
import type { BillingInvoice } from "@/types/billing-invoices";

const labels: Record<BillingInvoice["status"], string> = {
    paid: "Paid", open: "Open", draft: "Draft", void: "Voided", uncollectible: "Uncollectible",
};
const refundLabels = { partial: "Partially refunded", full: "Refunded" } as const;

function statusBadge(invoice: BillingInvoice) {
    if (invoice.isFreeTrial) return { label: "Free trial", tone: "border-success/30 bg-success/10 text-success" };
    if (invoice.refundStatus === "partial" || invoice.refundStatus === "full") {
        return { label: refundLabels[invoice.refundStatus], tone: "border-warning/40 bg-warning/10 text-warning-foreground" };
    }
    return { label: labels[invoice.status], tone: invoice.status === "paid" ? "border-success/30 bg-success/10 text-success" : undefined };
}

export function BillingInvoiceRow({ invoice }: { invoice: BillingInvoice }) {
    const label = invoice.number || invoice.id;
    const badge = statusBadge(invoice);
    return (
        <li className="grid min-w-0 gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center lg:grid-cols-[minmax(0,1fr)_auto_auto]">
            <div className="min-w-0 flex-1">
                <p className="break-all text-sm font-semibold">{label}</p>
                <time dateTime={invoice.createdAt} className="mt-1 block text-sm text-muted-foreground">
                    {new Date(invoice.createdAt).toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "short", day: "numeric" })}
                </time>
            </div>
            <div className="flex items-center gap-3 sm:gap-5">
                <div className="text-right">
                    <span className={cn("block text-sm font-semibold tabular-nums", invoice.refundStatus === "full" && "text-muted-foreground line-through")}>
                        {invoice.amount}
                    </span>
                    {invoice.refundedAmount && (
                        <span className="block text-xs text-muted-foreground tabular-nums">
                            {invoice.refundedAmount} refunded · {invoice.netAmount} net
                        </span>
                    )}
                </div>
                <Badge variant="outline" className={cn("whitespace-nowrap", badge.tone)}>{badge.label}</Badge>
            </div>
            <BillingInvoiceActions invoice={invoice} />
        </li>
    );
}
