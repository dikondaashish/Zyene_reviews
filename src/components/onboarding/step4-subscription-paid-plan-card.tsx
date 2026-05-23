"use client";

import { CheckCircle2, Crown, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as PricingCard from "@/components/ui/pricing-card";
import { cn } from "@/lib/utils";
import type { Plan } from "@/services/stripe/plans";

interface Step4SubscriptionPaidPlanCardProps {
    plan: Plan;
    trialIncludedText: string;
    startTrialCta: string;
    subscribeCta: string;
    checkoutOffersTrial: boolean | null;
    trialEligibilityLoading: boolean;
    loadingPlanId: string | null;
    planBusy: boolean;
    onSubscribe: (plan: Plan) => void;
    intervalLabel: string;
}

export function Step4SubscriptionPaidPlanCard({
    plan,
    trialIncludedText,
    startTrialCta,
    subscribeCta,
    checkoutOffersTrial,
    trialEligibilityLoading,
    loadingPlanId,
    planBusy,
    onSubscribe,
    intervalLabel,
}: Step4SubscriptionPaidPlanCardProps) {
    const isPro = plan.name === "Professional";

    return (
        <PricingCard.Card
            className={cn(
                "relative flex max-w-none flex-col size-full",
                "transition-all duration-300 hover:-translate-y-2 hover:border-border dark:hover:border-border",
                isPro && "ring-2 ring-primary/50 hover:ring-primary/70",
            )}
        >
            {isPro && (
                <div className="absolute -top-2 right-3 z-20">
                    <Badge className="bg-primary text-primary-foreground border-0">Most Popular</Badge>
                </div>
            )}
            <PricingCard.Header className="relative z-10 mb-2 p-2">
                <PricingCard.Plan>
                    <PricingCard.PlanName>
                        {isPro ? <Crown className="text-primary" aria-hidden /> : <Zap className="text-primary" aria-hidden />}
                        <span className="text-foreground">{plan.name}</span>
                    </PricingCard.PlanName>
                    <PricingCard.Badge>{isPro ? "Multi-location" : "Single location"}</PricingCard.Badge>
                </PricingCard.Plan>
                <PricingCard.Description className="mb-2 text-[11px] leading-tight">
                    {isPro ? "For growing multi-location businesses." : "Perfect for single-location businesses."}
                </PricingCard.Description>
                <PricingCard.Price>
                    {plan.originalPrice != null && plan.originalPrice > (plan.price || 0) && (
                        <PricingCard.OriginalPrice>${plan.originalPrice}</PricingCard.OriginalPrice>
                    )}
                    <PricingCard.MainPrice>${plan.price}</PricingCard.MainPrice>
                    <PricingCard.Period>{intervalLabel}</PricingCard.Period>
                </PricingCard.Price>
                {checkoutOffersTrial === true && (
                    <p className="text-xs font-medium text-chart-2 dark:text-chart-2 mb-3">{trialIncludedText}</p>
                )}
                <Button
                    className={cn(
                        "relative z-20 w-full font-semibold text-primary-foreground transition-all duration-300 cursor-pointer",
                        "bg-primary",
                        "hover:-translate-y-1 hover:brightness-110 active:translate-y-0",
                    )}
                    onClick={() => onSubscribe(plan)}
                    disabled={loadingPlanId === plan.id || planBusy}
                >
                    <span className="inline-flex items-center justify-center gap-2">
                        {(loadingPlanId === plan.id || trialEligibilityLoading) && (
                            <Loader2 className="animate-spin shrink-0 size-4" />
                        )}
                        {!trialEligibilityLoading && (checkoutOffersTrial ? startTrialCta : subscribeCta)}
                    </span>
                </Button>
            </PricingCard.Header>
            <PricingCard.Body className="space-y-2 p-2">
                <PricingCard.List className="space-y-2">
                    {plan.features.map((feature) => (
                        <PricingCard.ListItem key={feature} className="text-xs gap-2">
                            <span className="mt-0.5 shrink-0">
                                <CheckCircle2 className="text-chart-2 size-3.5" aria-hidden />
                            </span>
                            <span>{feature}</span>
                        </PricingCard.ListItem>
                    ))}
                </PricingCard.List>
            </PricingCard.Body>
        </PricingCard.Card>
    );
}
