"use client";

import { Crown, Zap, Loader2 } from "lucide-react";
import * as PricingCard from "@/components/ui/pricing-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Plan } from "@/services/stripe/plans";
import { isPaidPlanTierUpgrade } from "@/services/stripe/plans";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { BILLING_PLAN_PROFESSIONAL_ANCHOR_ID } from "@/lib/billing/business-limit-upgrade-href";
import { sameProductTier } from "@/components/settings/billing-plan-helpers";
import { BillingPlanFeatureList } from "@/components/settings/billing-plan-feature-list";

type BillingDict = Dictionary["billing"];

export function BillingPlanTierCard(props: {
    plan: Plan;
    currentPlan: Plan | null;
    planStatus: string;
    subscriptionHealthy: boolean;
    treatsAsReturningForCta: boolean;
    checkoutOffersTrial: boolean;
    loadingPlan: string | null;
    intervalLabel: string;
    billing: BillingDict;
    permissionTooltip: string | undefined;
    onRequestPlanChange: (plan: Plan) => void;
}) {
    const {
        plan,
        currentPlan,
        planStatus,
        subscriptionHealthy,
        treatsAsReturningForCta,
        checkoutOffersTrial,
        loadingPlan,
        intervalLabel,
        billing: b,
        permissionTooltip,
        onRequestPlanChange,
    } = props;

    const isExactCurrent = currentPlan?.id === plan.id;
    const tierMatch = sameProductTier(currentPlan, plan);
    const isBillingIntervalSwitch = tierMatch && currentPlan && currentPlan.id !== plan.id;
    const isPro = plan.name === "Professional";
    const priceConfigured = !!plan.stripePriceId;

    let planCta: string;
    if (treatsAsReturningForCta) {
        if (isBillingIntervalSwitch) {
            planCta = plan.interval === "year" ? b.switch_to_yearly : b.switch_to_monthly;
        } else {
            planCta = `${b.switch_to_prefix} ${plan.name}`;
        }
    } else {
        planCta = checkoutOffersTrial ? b.start_trial_cta : b.subscribe_cta;
    }

    const showTrialEndsOnUpgradeHint =
        planStatus === "trialing" &&
        subscriptionHealthy &&
        !isExactCurrent &&
        isPaidPlanTierUpgrade(currentPlan?.id, plan.id);

    const showProProratedHint =
        isPro && treatsAsReturningForCta && subscriptionHealthy && !isExactCurrent;

    return (
        <PricingCard.Card
            id={isPro ? BILLING_PLAN_PROFESSIONAL_ANCHOR_ID : undefined}
            className={cn(
                "relative flex min-w-0 max-w-none flex-col scroll-mt-28 size-full p-4 backdrop-blur-none dark:bg-card lg:row-span-2 lg:grid lg:grid-rows-subgrid xl:p-5",
                isPro && "border-primary/40",
                isExactCurrent && subscriptionHealthy && "ring-2 ring-primary/60"
            )}
        >
            {isPro && (
                <div className="absolute -top-2 right-3 z-20">
                    <Badge className="bg-primary text-primary-foreground border-0">Most popular</Badge>
                </div>
            )}
            <PricingCard.Header glassEffect={false} className="relative z-10 mb-5 rounded-none border-0 bg-transparent p-0 dark:bg-transparent [&>div]:flex [&>div]:h-full [&>div]:flex-col">
                <PricingCard.Plan className="mb-3 flex-wrap gap-2">
                    <PricingCard.PlanName className="text-base font-semibold">
                        {isPro ? <Crown className="text-primary" aria-hidden /> : <Zap className="text-primary" aria-hidden />}
                        <span className="text-foreground">{plan.name}</span>
                    </PricingCard.PlanName>
                    <PricingCard.Badge>{isPro ? "Multi-location" : "Single location"}</PricingCard.Badge>
                </PricingCard.Plan>
                <PricingCard.Description className="mb-5 text-sm leading-6 text-muted-foreground">
                    {isPro ? "For growing multi-location businesses." : "Perfect for single-location businesses."}
                </PricingCard.Description>
                <PricingCard.Price className="flex-wrap">
                    {plan.originalPrice && plan.originalPrice > (plan.price || 0) && (
                        <PricingCard.OriginalPrice className="ml-0 w-full text-sm">${plan.originalPrice}</PricingCard.OriginalPrice>
                    )}
                    <PricingCard.MainPrice>${plan.price}</PricingCard.MainPrice>
                    <PricingCard.Period>{intervalLabel}</PricingCard.Period>
                </PricingCard.Price>
                {!treatsAsReturningForCta && checkoutOffersTrial && (
                    <p className="text-xs font-medium text-success dark:text-success mb-3">{b.trial_included}</p>
                )}
                {showProProratedHint && (
                    <p className="text-xs text-muted-foreground mb-3">{b.pro_prorated_no_trial_badge}</p>
                )}
                {showTrialEndsOnUpgradeHint && (
                    <p className="text-xs text-warning-foreground dark:text-warning-foreground mb-3 leading-snug">{b.trial_ends_on_upgrade_notice}</p>
                )}
                {isExactCurrent && subscriptionHealthy ? (
                    <Button variant="outline" className="mt-auto min-h-11 w-full font-semibold" disabled>
                        {b.current_plan_badge}
                    </Button>
                ) : (
                    <Button
                        type="button"
                        className={cn(
                            "mt-auto min-h-11 w-full font-semibold text-primary-foreground",
                            "bg-primary",
                            "hover:bg-primary/90 disabled:opacity-60"
                        )}
                        onClick={() => onRequestPlanChange(plan)}
                        disabled={!!loadingPlan || !priceConfigured || !!permissionTooltip}
                        title={!priceConfigured ? b.billing_not_configured : permissionTooltip}
                    >
                        {loadingPlan === plan.stripePriceId ? <Loader2 className="animate-spin size-4" /> : null}
                        {planCta}
                    </Button>
                )}
            </PricingCard.Header>
            <BillingPlanFeatureList features={plan.features} />
        </PricingCard.Card>
    );
}
