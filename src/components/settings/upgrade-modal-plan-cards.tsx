"use client";

import { CheckCircle2, Crown, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as PricingCard from "@/components/ui/pricing-card";
import type { Plan } from "@/services/stripe/plans";
import { cn } from "@/lib/utils";

export function UpgradeModalPlanCards({
    displayPlans,
    intervalLabel,
    loadingPlan,
    onSubscribe,
}: {
    displayPlans: Plan[];
    intervalLabel: string;
    loadingPlan: string | null;
    onSubscribe: (priceId: string) => void;
}) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayPlans.map((plan) => {
                const isPro = plan.name === "Professional";

                return (
                    <PricingCard.Card
                        key={plan.id}
                        className={cn("relative flex max-w-none flex-col size-full", isPro && "ring-2 ring-primary/50")}
                    >
                        {isPro && (
                            <div className="absolute -top-2 right-3 z-20">
                                <Badge className="bg-primary text-primary-foreground border-0">Most Popular</Badge>
                            </div>
                        )}
                        <PricingCard.Header className="relative z-10 mb-3 p-3">
                            <PricingCard.Plan>
                                <PricingCard.PlanName>
                                    {isPro ? (
                                        <Crown className="text-primary" aria-hidden />
                                    ) : (
                                        <Zap className="text-primary" aria-hidden />
                                    )}
                                    <span className="text-foreground">{plan.name}</span>
                                </PricingCard.PlanName>
                                <PricingCard.Badge>{isPro ? "Multi-location" : "Single location"}</PricingCard.Badge>
                            </PricingCard.Plan>
                            <PricingCard.Description className="mb-2 text-[11px] leading-tight">
                                {isPro
                                    ? "For growing multi-location businesses."
                                    : "Perfect for single-location businesses."}
                            </PricingCard.Description>
                            <PricingCard.Price>
                                {plan.originalPrice && plan.originalPrice > (plan.price || 0) && (
                                    <PricingCard.OriginalPrice>${plan.originalPrice}</PricingCard.OriginalPrice>
                                )}
                                <PricingCard.MainPrice>${plan.price}</PricingCard.MainPrice>
                                <PricingCard.Period>{intervalLabel}</PricingCard.Period>
                            </PricingCard.Price>

                            <Button
                                type="button"
                                className={cn(
                                    "w-full font-semibold text-primary-foreground",
                                    "bg-primary",
                                    "hover:bg-primary/90",
                                )}
                                onClick={() => {
                                    if (!plan.stripePriceId) {
                                        toast.error(
                                            "Billing isn’t set up for this environment (Stripe price ID missing).",
                                        );
                                        return;
                                    }
                                    void onSubscribe(plan.stripePriceId);
                                }}
                                disabled={loadingPlan === plan.stripePriceId}
                            >
                                {loadingPlan === plan.stripePriceId ? (
                                    <Loader2 className="mr-2 animate-spin size-4" />
                                ) : null}
                                Start 7-day free trial
                            </Button>
                        </PricingCard.Header>
                        <PricingCard.Body className="space-y-3 p-2">
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
            })}
        </div>
    );
}
