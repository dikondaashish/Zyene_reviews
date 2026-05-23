"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { CustomerRow } from "@/components/customers/customer-detail-helpers";
import { displayName } from "@/components/customers/customer-detail-helpers";
import { SendRequestDialog } from "@/app/(dashboard)/requests/send-request-dialog";

export function CustomerDetailSendReviewButton({
    customer,
    businessId,
    businessSlug,
    businessName,
}: {
    customer: CustomerRow;
    businessId: string;
    businessSlug?: string | null;
    businessName?: string | null;
}) {
    const name = displayName(customer);
    const missingPhoneAndEmail = !customer.phone?.trim() && !customer.email?.trim();

    if (customer.is_opted_out) {
        return (
            <TooltipProvider delayDuration={200}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="inline-flex w-full sm:w-auto">
                            <Button
                                type="button"
                                disabled
                                className="h-9 w-full rounded-lg px-4 text-sm font-semibold sm:w-auto"
                            >
                                <Send className="mr-2 h-4 w-4" />
                                Send review request
                            </Button>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">This contact opted out of review requests.</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }
    if (missingPhoneAndEmail) {
        return (
            <TooltipProvider delayDuration={200}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="inline-flex w-full sm:w-auto">
                            <Button
                                type="button"
                                disabled
                                className="h-9 w-full rounded-lg px-4 text-sm font-semibold sm:w-auto"
                            >
                                <Send className="mr-2 h-4 w-4" />
                                Send review request
                            </Button>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                        Add a phone number or email to this contact to send a review request.
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }
    return (
        <SendRequestDialog
            businessId={businessId}
            businessSlug={businessSlug ?? undefined}
            businessName={businessName ?? undefined}
            initialCustomer={{
                name: name || "Customer",
                phone: (customer.phone ?? "").trim(),
                email: (customer.email ?? "").trim(),
            }}
            trigger={
                <Button
                    type="button"
                    className="h-9 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 sm:w-auto"
                >
                    <Send className="mr-2 h-4 w-4 opacity-90" />
                    Send review request
                </Button>
            }
        />
    );
}
