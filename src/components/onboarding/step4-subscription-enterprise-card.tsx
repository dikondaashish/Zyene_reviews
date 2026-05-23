"use client";

import { CheckCircle2, Building2, Mail } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import * as PricingCard from "@/components/ui/pricing-card";
import { cn } from "@/lib/utils";
import { enterpriseSalesGmailComposeUrl } from "@/lib/enterprise-sales-contact";
import type { Plan } from "@/services/stripe/plans";

export function Step4SubscriptionEnterpriseCard({ enterprisePlan }: { enterprisePlan: Plan }) {
    return (
        <PricingCard.Card className="relative flex w-full max-w-none flex-col border-dashed transition-all duration-300 hover:-translate-y-2 hover:border-solid hover:border-border dark:hover:border-border">
            <PricingCard.Header className="relative z-10">
                <PricingCard.Plan>
                    <PricingCard.PlanName>
                        <Building2 className="text-muted-foreground" aria-hidden />
                        <span className="text-foreground">Enterprise</span>
                    </PricingCard.PlanName>
                    <PricingCard.Badge>Custom</PricingCard.Badge>
                </PricingCard.Plan>
                <PricingCard.Description className="mb-3">For large organizations with custom needs.</PricingCard.Description>
                <PricingCard.Price>
                    <PricingCard.MainPrice className="text-2xl">Custom</PricingCard.MainPrice>
                </PricingCard.Price>
                <a
                    href={enterpriseSalesGmailComposeUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                        buttonVariants({ variant: "outline", size: "default" }),
                        "w-full gap-2 font-semibold transition-all duration-200 hover:-translate-y-1 hover:bg-muted dark:hover:bg-muted",
                    )}
                >
                    <Mail className="h-4 w-4" aria-hidden />
                    Contact Sales
                </a>
            </PricingCard.Header>
            <PricingCard.Body>
                <PricingCard.List>
                    {enterprisePlan.features.map((feature) => (
                        <PricingCard.ListItem key={feature}>
                            <span className="mt-0.5 shrink-0">
                                <CheckCircle2 className="h-4 w-4 text-chart-2" aria-hidden />
                            </span>
                            <span>{feature}</span>
                        </PricingCard.ListItem>
                    ))}
                </PricingCard.List>
            </PricingCard.Body>
        </PricingCard.Card>
    );
}
