"use client";

import { CheckCircle2, Building2, Mail } from "lucide-react";
import * as PricingCard from "@/components/ui/pricing-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Plan } from "@/services/stripe/plans";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { enterpriseSalesGmailComposeUrl } from "@/lib/enterprise-sales-contact";

type BillingDict = Dictionary["billing"];

export function BillingPlanEnterpriseCard(props: {
    enterprisePlan: Plan;
    isEnterpriseOrg: boolean;
    subscriptionHealthy: boolean;
    billing: BillingDict;
}) {
    const { enterprisePlan, isEnterpriseOrg, subscriptionHealthy, billing: b } = props;

    return (
        <PricingCard.Card
            className={cn(
                "relative flex w-full max-w-none flex-col border-dashed",
                isEnterpriseOrg && subscriptionHealthy && "ring-2 ring-primary/60"
            )}
        >
            <PricingCard.Header className="relative z-10">
                <PricingCard.Plan>
                    <PricingCard.PlanName>
                        <Building2 className="text-muted-foreground" aria-hidden />
                        <span className="text-foreground">Enterprise</span>
                    </PricingCard.PlanName>
                    <PricingCard.Badge>Custom</PricingCard.Badge>
                </PricingCard.Plan>
                <PricingCard.Description className="mb-2 text-[11px] leading-snug text-muted-foreground">
                    For large organizations with custom needs.
                </PricingCard.Description>
                <PricingCard.Price>
                    <PricingCard.MainPrice className="text-2xl">Custom</PricingCard.MainPrice>
                </PricingCard.Price>
                {isEnterpriseOrg && subscriptionHealthy ? (
                    <Button variant="outline" className="w-full font-semibold" disabled>
                        {b.current_plan_badge}
                    </Button>
                ) : (
                    <a
                        href={enterpriseSalesGmailComposeUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full gap-2 font-semibold")}
                    >
                        <Mail className="size-4" aria-hidden />
                        Contact sales
                    </a>
                )}
            </PricingCard.Header>
            <PricingCard.Body>
                <PricingCard.List>
                    {enterprisePlan.features.map((feature) => (
                        <PricingCard.ListItem key={feature}>
                            <span className="mt-0.5 shrink-0">
                                <CheckCircle2 className="text-chart-2 size-4" aria-hidden />
                            </span>
                            <span>{feature}</span>
                        </PricingCard.ListItem>
                    ))}
                </PricingCard.List>
            </PricingCard.Body>
        </PricingCard.Card>
    );
}
