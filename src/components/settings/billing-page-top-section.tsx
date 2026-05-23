"use client";

import { Lock, AlertTriangle } from "lucide-react";
import { PastDueBillingAlert } from "@/components/billing/past-due-billing-alert";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type BillingDict = Dictionary["billing"];

export function BillingPageTopSection(props: {
    billing: BillingDict;
    canManageBilling: boolean;
    planStatus: string;
    hasStripeCustomer: boolean;
    loadingPortal: boolean;
    onManageSubscription: () => void;
}) {
    const { billing: b, canManageBilling, planStatus, hasStripeCustomer, loadingPortal, onManageSubscription } = props;

    return (
        <>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{b.title}</h1>
                <p className="text-muted-foreground">{b.subtitle}</p>
            </div>

            {!canManageBilling && (
                <div className="rounded-lg border border-chart-4/35 bg-chart-4/12 dark:bg-chart-4/20 dark:border-chart-4/40 px-4 py-3 flex gap-3 text-sm text-chart-4 dark:text-chart-4">
                    <Lock className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                    <p>{b.no_billing_permission}</p>
                </div>
            )}

            {planStatus === "canceled" && (
                <div className="rounded-lg border border-border bg-muted px-4 py-3 flex gap-3 text-sm">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden />
                    <p className="text-muted-foreground">{b.subscription_ended}</p>
                </div>
            )}

            {planStatus === "past_due" && (
                <PastDueBillingAlert
                    layout="panel"
                    action={{
                        label: "Update payment",
                        disabled: !hasStripeCustomer,
                        loading: loadingPortal,
                        onClick: () => void onManageSubscription(),
                    }}
                />
            )}
        </>
    );
}
