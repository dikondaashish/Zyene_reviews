"use client";

import { CheckCircle2, Crown, Zap, Loader2 } from "lucide-react";
import * as PricingCard from "@/components/ui/pricing-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Plan } from "@/services/stripe/plans";
import { isPaidPlanTierUpgrade } from "@/services/stripe/plans";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { BILLING_PLAN_PROFESSIONAL_ANCHOR_ID } from "@/lib/billing/business-limit-upgrade-href";
import { sameProductTier } from "@/components/settings/billing-plan-helpers";

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
                "relative flex w-full max-w-none flex-col h-full scroll-mt-28",
                isPro && "ring-2 ring-primary/50",
                isExactCurrent && subscriptionHealthy && "ring-2 ring-primary/60"
            )}
        >
            {isPro && (
                <div className="absolute -top-2 right-3 z-20">
                    <Badge className="bg-primary text-primary-foreground border-0">Most popular</Badge>
                </div>
            )}
            <PricingCard.Header className="relative z-10 mb-3 p-3">
                <PricingCard.Plan>
                    <PricingCard.PlanName>
                        {isPro ? <Crown className="text-primary" aria-hidden /> : <Zap className="text-primary" aria-hidden />}
                        <span className="text-foreground">{plan.name}</span>
                    </PricingCard.PlanName>
                    <PricingCard.Badge>{isPro ? "Multi-location" : "Single location"}</PricingCard.Badge>
                </PricingCard.Plan>
                <PricingCard.Description className="mb-2 text-[11px] leading-snug text-muted-foreground">
                    {isPro ? "For growing multi-location businesses." : "Perfect for single-location businesses."}
                </PricingCard.Description>
                <PricingCard.Price>
                    {plan.originalPrice && plan.originalPrice > (plan.price || 0) && (
                        <PricingCard.OriginalPrice>${plan.originalPrice}</PricingCard.OriginalPrice>
                    )}
                    <PricingCard.MainPrice>${plan.price}</PricingCard.MainPrice>
                    <PricingCard.Period>{intervalLabel}</PricingCard.Period>
                </PricingCard.Price>
                {!treatsAsReturningForCta && checkoutOffersTrial && (
                    <p className="text-xs font-medium text-chart-2 dark:text-chart-2 mb-3">{b.trial_included}</p>
                )}
                {showProProratedHint && (
                    <p className="text-xs text-muted-foreground mb-3">{b.pro_prorated_no_trial_badge}</p>
                )}
                {isExactCurrent && subscriptionHealthy ? (
                    <Button variant="outline" className="w-full font-semibold" disabled>
                        {b.current_plan_badge}
                    </Button>
                ) : (
                    <Button
                        type="button"
                        className={cn(
                            "w-full font-semibold text-primary-foreground",
                            "bg-primary",
                            "hover:bg-primary/90 disabled:opacity-60"
                        )}
                        onClick={() => onRequestPlanChange(plan)}
                        disabled={loadingPlan === plan.stripePriceId}
                        title={!priceConfigured ? b.billing_not_configured : permissionTooltip}
                    >
                        {loadingPlan === plan.stripePriceId ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {planCta}
                    </Button>
                )}
                {showTrialEndsOnUpgradeHint && (
                    <p className="text-xs text-chart-4 dark:text-chart-4 mt-2 leading-snug">{b.trial_ends_on_upgrade_notice}</p>
                )}
            </PricingCard.Header>
            <PricingCard.Body className="space-y-3 p-2">
                <PricingCard.List className="space-y-2">
                    {plan.features.map((feature) => (
                        <PricingCard.ListItem key={feature} className="text-xs gap-2">
                            <span className="mt-0.5 shrink-0">
                                <CheckCircle2 className="h-3.5 w-3.5 text-chart-2" aria-hidden />
                            </span>
                            <span>{feature}</span>
                        </PricingCard.ListItem>
                    ))}
                </PricingCard.List>
            </PricingCard.Body>
        </PricingCard.Card>
    );
}
