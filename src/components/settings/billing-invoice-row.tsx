import { Badge } from "@/components/ui/badge";
import { BillingInvoiceActions } from "@/components/settings/billing-invoice-actions";
import { cn } from "@/lib/utils";
import type { BillingInvoice } from "@/types/billing-invoices";

const labels: Record<BillingInvoice["status"], string> = {
    paid: "Paid", open: "Open", draft: "Draft", void: "Voided", uncollectible: "Uncollectible",
};

export function BillingInvoiceRow({ invoice }: { invoice: BillingInvoice }) {
    const label = invoice.number || invoice.id;
    return (
        <li className="grid min-w-0 gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center lg:grid-cols-[minmax(0,1fr)_auto_auto]">
            <div className="min-w-0 flex-1">
                <p className="break-all text-sm font-semibold">{label}</p>
                <time dateTime={invoice.createdAt} className="mt-1 block text-sm text-muted-foreground">
                    {new Date(invoice.createdAt).toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "short", day: "numeric" })}
                </time>
            </div>
            <div className="flex items-center gap-3 sm:gap-5">
                <span className="text-sm font-semibold tabular-nums">{invoice.amount}</span>
                <Badge variant="outline" className={cn("whitespace-nowrap", invoice.status === "paid" && "border-success/30 bg-success/10 text-success")}>
                    {invoice.isFreeTrial ? "Free trial" : labels[invoice.status]}
                </Badge>
            </div>
            <BillingInvoiceActions invoice={invoice} />
        </li>
    );
}
