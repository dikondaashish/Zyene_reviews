"use client";

import { CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BillingInvoicesDialog } from "@/components/settings/billing-invoices-dialog";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function BillingCurrentPlanFooter(props: {
    billing: Dictionary["billing"];
    organizationId: string;
    hasStripeCustomer: boolean;
    canManageBilling: boolean;
    loadingPortal: boolean;
    onManageSubscription: () => void;
    permissionTooltip: string | undefined;
}) {
    const { billing: b, organizationId, hasStripeCustomer, canManageBilling, loadingPortal, onManageSubscription, permissionTooltip } = props;
    if (!hasStripeCustomer) return null;

    return (
        <CardFooter className="flex-col items-stretch gap-3 border-t bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
            <p className="order-2 text-xs text-muted-foreground sm:order-1">{b.portal_help}</p>
            <div className="order-1 flex shrink-0 flex-col gap-2 sm:order-2 sm:flex-row sm:items-center">
                <BillingInvoicesDialog organizationId={organizationId} canManageBilling={canManageBilling} hasStripeCustomer={hasStripeCustomer} />
                <Button variant="outline" onClick={() => void onManageSubscription()}
                    disabled={loadingPortal || !!permissionTooltip} title={permissionTooltip} className="min-h-11 gap-2">
                    {loadingPortal ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <CreditCard className="size-4" aria-hidden />}
                    {b.manage_subscription}
                    <ExternalLink className="size-3 opacity-70" aria-hidden />
                </Button>
            </div>
        </CardFooter>
    );
}
