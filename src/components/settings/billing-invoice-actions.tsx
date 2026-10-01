import { CreditCard, Download, ExternalLink, Receipt } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BillingInvoice } from "@/types/billing-invoices";

export function BillingInvoiceActions({ invoice }: { invoice: BillingInvoice }) {
    const label = invoice.number || invoice.id;
    const outline = cn(buttonVariants({ variant: "outline" }), "min-h-11 gap-2");
    return (
        <div className="flex min-w-0 flex-col gap-2 sm:col-span-2 sm:flex-row sm:justify-end lg:col-span-1">
            {invoice.pdfUrl ? (
                <a href={invoice.pdfUrl} download target="_blank" rel="noopener noreferrer"
                    aria-label={`Download invoice ${label}`} className={outline}>
                    <Download className="size-4" aria-hidden />Download invoice
                </a>
            ) : invoice.hostedUrl ? (
                <a href={invoice.hostedUrl} target="_blank" rel="noopener noreferrer"
                    aria-label={`View invoice ${label}`} className={outline}>
                    <ExternalLink className="size-4" aria-hidden />View invoice
                </a>
            ) : <span className="text-sm text-muted-foreground">PDF not available yet</span>}
            {invoice.status === "paid" && invoice.receiptUrl && (
                <a href={invoice.receiptUrl} target="_blank" rel="noopener noreferrer"
                    title="Open Stripe to download your receipt" aria-label={`Download receipt for invoice ${label}`}
                    className={outline}>
                    <Receipt className="size-4" aria-hidden />Download receipt
                </a>
            )}
            {invoice.status === "open" && invoice.paymentUrl && (
                <a href={invoice.paymentUrl} target="_blank" rel="noopener noreferrer"
                    title="Pay securely with Stripe" aria-label={`Pay invoice ${label}`}
                    className={cn(buttonVariants(), "min-h-11 gap-2")}>
                    <CreditCard className="size-4" aria-hidden />Pay now
                </a>
            )}
        </div>
    );
}
