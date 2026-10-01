import { Download, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BillingInvoice } from "@/types/billing-invoices";

const labels: Record<BillingInvoice["status"], string> = {
    paid: "Paid", open: "Open", draft: "Draft", void: "Voided", uncollectible: "Uncollectible",
};

export function BillingInvoiceRow({ invoice }: { invoice: BillingInvoice }) {
    const label = invoice.number || invoice.id;
    return (
        <li className="flex min-w-0 flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
                <p className="break-all text-sm font-semibold">{label}</p>
                <time dateTime={invoice.createdAt} className="mt-1 block text-sm text-muted-foreground">
                    {new Date(invoice.createdAt).toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "short", day: "numeric" })}
                </time>
            </div>
            <div className="flex items-center gap-3 sm:gap-5">
                <span className="text-sm font-semibold tabular-nums">{invoice.amount}</span>
                <Badge variant="outline" className={cn("whitespace-nowrap", invoice.status === "paid" && "border-success/30 bg-success/10 text-success")}>
                    {labels[invoice.status]}
                </Badge>
            </div>
            {invoice.pdfUrl ? (
                <a href={invoice.pdfUrl} download target="_blank" rel="noopener noreferrer"
                    aria-label={`Download PDF for invoice ${label}`}
                    className={cn(buttonVariants({ variant: "outline" }), "min-h-11 gap-2 sm:ml-2")}>
                    <Download className="size-4" aria-hidden />Download PDF
                </a>
            ) : invoice.hostedUrl ? (
                <a href={invoice.hostedUrl} target="_blank" rel="noopener noreferrer"
                    aria-label={`View invoice ${label}`}
                    className={cn(buttonVariants({ variant: "outline" }), "min-h-11 gap-2 sm:ml-2")}>
                    <ExternalLink className="size-4" aria-hidden />View invoice
                </a>
            ) : <span className="text-sm text-muted-foreground sm:ml-2">PDF not available yet</span>}
        </li>
    );
}
