"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as PricingCard from "@/components/ui/pricing-card";
import { cn } from "@/lib/utils";
import type { Plan } from "@/services/stripe/plans";
import { Step4PlanFeatureList } from "./step4-plan-feature-list";

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
                "transition-colors hover:border-primary/40",
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
                    <p className="text-xs font-medium text-success dark:text-success mb-3">{trialIncludedText}</p>
                )}
                <Button
                    className={cn(
                        "relative z-20 w-full font-semibold text-primary-foreground transition-all duration-300 cursor-pointer",
                        "bg-primary",
                        "hover:brightness-110",
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
                <Step4PlanFeatureList features={plan.features} />
            </PricingCard.Body>
        </PricingCard.Card>
    );
}
