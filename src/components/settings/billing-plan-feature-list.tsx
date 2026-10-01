import { CheckCircle2 } from "lucide-react";
import * as PricingCard from "@/components/ui/pricing-card";
import type { Plan } from "@/services/stripe/plans";

export function BillingPlanFeatureList({ features }: { features: Plan["features"] }) {
    return (
        <PricingCard.Body className="border-t border-border px-0 pb-0 pt-5">
            <PricingCard.List className="space-y-2">
                {features.map((feature) => (
                    <PricingCard.ListItem key={feature} className="text-sm leading-6 gap-2">
                        <span className="mt-0.5 shrink-0">
                            <CheckCircle2 className="text-success size-3.5" aria-hidden />
                        </span>
                        <span>{feature}</span>
                    </PricingCard.ListItem>
                ))}
            </PricingCard.List>
        </PricingCard.Body>
    );
}
