"use client";

import Link from "next/link";
import { Check, Zap, Crown, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Plan } from "@/services/stripe/plans";

export function PricingClientPlanCard({
    plan,
    isPopular,
    signupUrl,
}: {
    plan: Plan;
    isPopular: boolean;
    signupUrl: string;
}) {
    const isEnterprise = plan.id === "enterprise";
    const monthlyEquivalent =
        plan.interval === "year" && plan.price ? (plan.price / 12).toFixed(2) : plan.price?.toFixed(2);

    const originalMonthlyEquivalent =
        plan.interval === "year" && plan.originalPrice
            ? (plan.originalPrice / 12).toFixed(2)
            : plan.originalPrice?.toFixed(2);

    if (isPopular) {
        return (
            <div className="relative bg-[color:var(--marketing-footer-bg)] text-[color:var(--marketing-footer-fg)] border-2 border-primary rounded-2xl p-8 flex flex-col">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-5 py-1 rounded-full whitespace-nowrap">
                    Most Popular
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <Crown className="text-primary size-5" />
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                </div>
                <p className="text-sm text-[color:var(--marketing-footer-muted)] mb-6">
                    For growing multi-location businesses
                </p>
                <div className="mb-1">
                    {originalMonthlyEquivalent && (
                        <span className="text-base line-through text-[color:var(--marketing-footer-muted)] mr-2">
                            ${originalMonthlyEquivalent}
                        </span>
                    )}
                    <span className="text-5xl font-bold">${monthlyEquivalent}</span>
                    <span className="text-[color:var(--marketing-footer-muted)] ml-1 text-sm">/mo</span>
                </div>
                {plan.interval === "year" && (
                    <p className="text-xs text-[color:var(--marketing-footer-muted)] mb-1">
                        Billed ${plan.price?.toFixed(2)}/year
                    </p>
                )}
                <p className="text-sm text-primary font-semibold mb-6">7-day free trial — cancel anytime, no charge</p>
                <ul className="space-y-2.5 text-sm text-[color:var(--marketing-footer-list)] flex-1 mb-8">
                    {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                            <Check className="text-primary shrink-0 mt-0.5 size-4" />
                            {f}
                        </li>
                    ))}
                </ul>
                <Link href={signupUrl}>
                    <Button className="w-full rounded-lg py-6 font-semibold text-base">
                        Start 7-day free trial <ArrowRight className="ml-2 size-4" />
                    </Button>
                </Link>
            </div>
        );
    }

    if (isEnterprise) {
        return (
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="text-primary size-5" />
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">For large organizations with custom needs</p>
                <div className="mb-6">
                    <span className="text-5xl font-bold text-foreground">Custom</span>
                </div>
                <ul className="space-y-2.5 text-sm text-muted-foreground flex-1 mb-8">
                    {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                            <Check className="text-primary shrink-0 mt-0.5 size-4" />
                            {f}
                        </li>
                    ))}
                </ul>
                <a href="mailto:sales@zyenereviews.com?subject=Enterprise%20Plan%20Inquiry">
                    <Button variant="outline" className="w-full rounded-lg py-6 font-semibold text-base">
                        Contact Sales
                    </Button>
                </a>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-2xl p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
                <Zap className="text-primary size-5" />
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Perfect for single-location businesses</p>
            <div className="mb-1">
                {originalMonthlyEquivalent && (
                    <span className="text-base line-through text-muted-foreground mr-2">${originalMonthlyEquivalent}</span>
                )}
                <span className="text-5xl font-bold text-foreground">${monthlyEquivalent}</span>
                <span className="text-muted-foreground ml-1 text-sm">/mo</span>
            </div>
            {plan.interval === "year" && (
                <p className="text-xs text-muted-foreground mb-1">Billed ${plan.price?.toFixed(2)}/year</p>
            )}
            <p className="text-sm text-primary font-semibold mb-6">7-day free trial — cancel anytime, no charge</p>
            <ul className="space-y-2.5 text-sm text-muted-foreground flex-1 mb-8">
                {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                        <Check className="text-primary shrink-0 mt-0.5 size-4" />
                        {f}
                    </li>
                ))}
            </ul>
            <Link href={signupUrl}>
                <Button className="w-full rounded-lg py-6 font-semibold text-base">
                    Start 7-day free trial <ArrowRight className="ml-2 size-4" />
                </Button>
            </Link>
        </div>
    );
}
