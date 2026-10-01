"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BillingInvoiceHistory } from "@/components/settings/billing-invoice-history";

export function BillingInvoicesDialog(props: {
    organizationId: string;
    canManageBilling: boolean;
    hasStripeCustomer: boolean;
}) {
    const [open, setOpen] = useState(false);
    if (!props.canManageBilling) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="min-h-11 gap-2">
                    <FileText className="size-4" aria-hidden />Invoices
                </Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl sm:p-0">
                <DialogHeader className="shrink-0 border-b px-5 py-5 pr-12 text-left sm:px-6 sm:pr-12">
                    <DialogTitle>Invoices</DialogTitle>
                    <DialogDescription>View your billing history and download invoice PDFs.</DialogDescription>
                </DialogHeader>
                <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pb-5 sm:px-6 sm:pb-6">
                    {open && <BillingInvoiceHistory {...props} />}
                </div>
            </DialogContent>
        </Dialog>
    );
}
