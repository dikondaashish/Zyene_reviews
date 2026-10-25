"use client";

import { Building2, Mail } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import * as PricingCard from "@/components/ui/pricing-card";
import { cn } from "@/lib/utils";
import { enterpriseSalesGmailComposeUrl } from "@/lib/enterprise-sales-contact";
import type { Plan } from "@/services/stripe/plans";
import { Step4PlanFeatureList } from "./step4-plan-feature-list";

export function Step4SubscriptionEnterpriseCard({ enterprisePlan }: { enterprisePlan: Plan }) {
    return (
        <PricingCard.Card className="relative flex w-full max-w-none flex-col border-dashed transition-colors hover:border-solid hover:border-primary/40">
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
                        "w-full gap-2 font-semibold transition-colors hover:bg-muted dark:hover:bg-muted",
                    )}
                >
                    <Mail className="size-4" aria-hidden />
                    Contact Sales
                </a>
            </PricingCard.Header>
            <PricingCard.Body>
                <Step4PlanFeatureList features={enterprisePlan.features} />
            </PricingCard.Body>
        </PricingCard.Card>
    );
}
