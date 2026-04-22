"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Zap, Crown } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as PricingCard from "@/components/ui/pricing-card";
import { PLANS } from "@/services/stripe/plans";
import { cn } from "@/lib/utils";
import { parseBillingCheckoutResponse } from "@/lib/billing/parse-checkout-response";

export function UpgradeModal({
    isOpen,
    onClose,
    title = "Upgrade Your Plan",
    description = "You've reached your usage limit. Please upgrade to continue.",
}: {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
}) {
    const [interval, setInterval] = useState<"month" | "year">("month");
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    // Exclude enterprise for the main cards
    const displayPlans = PLANS.filter((p) => p.interval === interval && p.id !== "enterprise");
    const intervalLabel = interval === "month" ? "/mo" : "/yr";
    const monthlyStarterPrice = PLANS.find((p) => p.id === "starter_monthly")?.price ?? 0;
    const yearlyStarterPrice = PLANS.find((p) => p.id === "starter_yearly")?.price ?? 0;
    const yearlySavings =
        monthlyStarterPrice > 0 ? Math.round((1 - yearlyStarterPrice / (monthlyStarterPrice * 12)) * 100) : 0;

    async function handleSubscribe(priceId: string) {
        setLoadingPlan(priceId);
        try {
            const res = await fetch("/api/billing/checkout", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId, source: "billing" }),
            });
            const json = await res.json();
            const parsed = parseBillingCheckoutResponse(json);

            if (!res.ok || !parsed.ok) {
                throw new Error(parsed.error || "Checkout failed");
            }

            const payload = parsed.payload;
            if (payload?.switched && payload.url) {
                toast.success("Plan updated", {
                    description: "Redirecting to confirm your subscription…",
                });
                onClose();
                window.location.assign(payload.url);
            } else if (payload?.url) {
                window.location.assign(payload.url);
            } else {
                throw new Error("No checkout URL returned");
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to start checkout");
        } finally {
            setLoadingPlan(null);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[95vw] max-w-5xl sm:max-w-3xl md:max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted/20 p-4 md:p-6 mt-4">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
                        style={{
                            backgroundImage: "radial-gradient(rgba(0,0,0,0.06) 0.8px, transparent 0.8px)",
                            backgroundSize: "14px 14px",
                            maskImage:
                                "radial-gradient(ellipse at 50% 10%, rgba(0,0,0,1), rgba(0,0,0,0.25) 45%, rgba(0,0,0,0) 72%)",
                        }}
                    />

                    <div className="relative z-10">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center mb-6">
                            <div
                                className="inline-flex items-center gap-0.5 rounded-full border border-border bg-muted/80 p-1 dark:border-border/60 dark:bg-muted/80"
                                role="tablist"
                            >
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={interval === "month"}
                                    onClick={() => setInterval("month")}
                                    className={cn(
                                        "rounded-full px-4 py-1.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                                        interval === "month"
                                            ? "bg-card text-foreground ring-1 ring-primary/40 dark:bg-card dark:text-foreground dark:ring-primary/50"
                                            : "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
                                    )}
                                >
                                    Monthly
                                </button>
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={interval === "year"}
                                    onClick={() => setInterval("year")}
                                    className={cn(
                                        "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                                        interval === "year"
                                            ? "bg-card text-foreground ring-1 ring-primary/40 dark:bg-card dark:text-foreground dark:ring-primary/50"
                                            : "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
                                    )}
                                >
                                    Yearly
                                    <Badge
                                        variant="secondary"
                                        className="text-xs bg-chart-2/15 text-chart-2 border-chart-2/30 dark:bg-chart-2/20 dark:text-chart-2 dark:border-chart-2/30"
                                    >
                                        Save {yearlySavings > 0 ? `~${yearlySavings}%` : "more"}
                                    </Badge>
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {displayPlans.map((plan) => {
                                const isPro = plan.name === "Professional";

                                return (
                                    <PricingCard.Card
                                        key={plan.id}
                                        className={cn(
                                            "relative flex w-full max-w-none flex-col h-full",
                                            isPro &&
                                                "ring-2 ring-primary/50"
                                        )}
                                    >
                                        {isPro && (
                                            <div className="absolute -top-2 right-3 z-20">
                                                <Badge className="bg-primary text-primary-foreground border-0">
                                                    Most Popular
                                                </Badge>
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
                                                <PricingCard.Badge>
                                                    {isPro ? "Multi-location" : "Single location"}
                                                </PricingCard.Badge>
                                            </PricingCard.Plan>
                                            <PricingCard.Description className="mb-2 text-[11px] leading-tight">
                                                {isPro
                                                    ? "For growing multi-location businesses."
                                                    : "Perfect for single-location businesses."}
                                            </PricingCard.Description>
                                            <PricingCard.Price>
                                                {plan.originalPrice && plan.originalPrice > (plan.price || 0) && (
                                                    <PricingCard.OriginalPrice>
                                                        ${plan.originalPrice}
                                                    </PricingCard.OriginalPrice>
                                                )}
                                                <PricingCard.MainPrice>${plan.price}</PricingCard.MainPrice>
                                                <PricingCard.Period>{intervalLabel}</PricingCard.Period>
                                            </PricingCard.Price>
                                            
                                            <Button
                                                type="button"
                                                className={cn(
                                                    "w-full font-semibold text-primary-foreground",
                                                    "bg-primary",
                                                    "hover:bg-primary/90"
                                                )}
                                                onClick={() => {
                                                    if (!plan.stripePriceId) {
                                                        toast.error(
                                                            "Billing isn’t set up for this environment (Stripe price ID missing)."
                                                        );
                                                        return;
                                                    }
                                                    void handleSubscribe(plan.stripePriceId);
                                                }}
                                                disabled={loadingPlan === plan.stripePriceId}
                                            >
                                                {loadingPlan === plan.stripePriceId ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : null}
                                                Start 7-day free trial
                                            </Button>
                                        </PricingCard.Header>
                                        <PricingCard.Body className="space-y-3 p-2">
                                            <PricingCard.List className="space-y-2">
                                                {plan.features.map((feature) => (
                                                    <PricingCard.ListItem key={feature} className="text-xs gap-2">
                                                        <span className="mt-0.5 shrink-0">
                                                            <CheckCircle2
                                                                className="h-3.5 w-3.5 text-chart-2"
                                                                aria-hidden
                                                            />
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
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
