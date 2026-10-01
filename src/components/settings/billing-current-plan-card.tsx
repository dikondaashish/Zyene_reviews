"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Plan } from "@/services/stripe/plans";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { BillingDerivedState } from "@/components/settings/billing-client-derived";
import { BillingCurrentPlanUsageSection } from "@/components/settings/billing-current-plan-usage-section";
import { BillingCurrentPlanFooter } from "@/components/settings/billing-current-plan-footer";

type BillingDict = Dictionary["billing"];

export function BillingCurrentPlanCard(props: {
    billing: BillingDict;
    organizationId: string;
    canManageBilling: boolean;
    currentPlan: Plan | null;
    planStatus: string;
    hasStripeCustomer: boolean;
    checkoutOffersTrial: boolean;
    loadingPortal: boolean;
    onManageSubscription: () => void;
    derived: BillingDerivedState;
    permissionTooltip: string | undefined;
}) {
    const {
        billing: b,
        organizationId,
        canManageBilling,
        currentPlan,
        planStatus,
        hasStripeCustomer,
        checkoutOffersTrial,
        loadingPortal,
        onManageSubscription,
        derived,
        permissionTooltip,
    } = props;

    const {
        isEnterpriseOrg,
        hasPricedPlan,
        isPaidPlan,
        currentPlanDisplayName,
        displayUsage,
    } = derived;

    return (
        <Card className="overflow-hidden rounded-xl border-border shadow-none">
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <CardTitle className="text-base font-semibold">{b.current_plan}</CardTitle>
                        <CardDescription>{b.active_subscription}</CardDescription>
                    </div>
                    <Badge
                        variant={isPaidPlan ? (planStatus === "trialing" ? "secondary" : "default") : "secondary"}
                        className={cn(
                            "text-sm px-3 py-1 w-fit",
                            planStatus === "trialing" && "bg-primary/10 text-primary border-primary/20"
                        )}
                    >
                        {isPaidPlan
                            ? planStatus === "trialing"
                                ? `${currentPlanDisplayName} (trial)`
                                : currentPlanDisplayName
                            : planStatus === "canceled" && (hasPricedPlan || isEnterpriseOrg)
                              ? `${currentPlanDisplayName} (canceled)`
                              : b.no_active_plan}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="grid gap-8 lg:grid-cols-[minmax(180px,0.6fr)_minmax(0,1.4fr)] lg:gap-10">
                <div className="flex flex-wrap content-start items-baseline gap-2">
                    {hasPricedPlan ? (
                        <>
                            {currentPlan?.originalPrice && currentPlan.originalPrice > (currentPlan.price || 0) && (
                                <span className="text-sm line-through text-muted-foreground">
                                    ${currentPlan.originalPrice}
                                </span>
                            )}
                            <span className="text-3xl font-semibold tracking-tight tabular-nums">${currentPlan?.price}</span>
                            <span className="text-muted-foreground">
                                /{currentPlan?.interval === "year" ? "year" : "month"}
                            </span>
                        </>
                    ) : isEnterpriseOrg ? (
                        <span className="text-2xl font-semibold text-foreground">Custom pricing</span>
                    ) : (
                        <>
                            <span className="text-2xl font-bold">{b.no_active_plan}</span>
                            <span className="text-muted-foreground text-sm">{b.choose_plan}</span>
                        </>
                    )}
                </div>

                <BillingCurrentPlanUsageSection billing={b} displayUsage={displayUsage} />
            </CardContent>

            <BillingCurrentPlanFooter billing={b} organizationId={organizationId} canManageBilling={canManageBilling}
                hasStripeCustomer={hasStripeCustomer} loadingPortal={loadingPortal}
                onManageSubscription={onManageSubscription} permissionTooltip={permissionTooltip} />

            {!isPaidPlan && !hasStripeCustomer && (
                <CardFooter className="bg-primary/10 dark:bg-primary/15 border-t flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4">
                    <Sparkles className="text-primary shrink-0 hidden sm:block size-5" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary">{b.starter_msg}</p>
                        <p className="text-xs text-primary/90">
                            {checkoutOffersTrial ? b.starter_price : b.starter_price_no_trial}
                        </p>
                    </div>
                    <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 gap-1 shrink-0 text-primary-foreground"
                        onClick={() => document.getElementById("plan-picker")?.scrollIntoView({ behavior: "smooth" })}
                    >
                        {b.upgrade} <ArrowRight className="size-3.5" />
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
