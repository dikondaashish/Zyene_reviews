"use client";

import Link from "next/link";
import type { Plan } from "@/services/stripe/plans";
import { PricingClientPlanCard } from "./pricing-client-plan-card";

interface PricingClientPlansSectionProps {
    starter: Plan;
    pro: Plan;
    enterprise: Plan;
    signupUrl: string;
}

export function PricingClientPlansSection({ starter, pro, enterprise, signupUrl }: PricingClientPlansSectionProps) {
    return (
        <section className="pb-24 px-4 bg-background">
            <div className="container mx-auto max-w-6xl">
                <div className="grid md:grid-cols-3 gap-8">
                    <PricingClientPlanCard plan={starter} isPopular={false} signupUrl={signupUrl} />
                    <PricingClientPlanCard plan={pro} isPopular signupUrl={signupUrl} />
                    <PricingClientPlanCard plan={enterprise} isPopular={false} signupUrl={signupUrl} />
                </div>
                <p className="text-center text-xs text-muted-foreground mt-8">
                    All prices in USD. Taxes may apply. By starting a trial you agree to our{" "}
                    <Link href="/terms" className="underline hover:text-foreground">
                        Terms of Service
                    </Link>
                    .
                </p>
            </div>
        </section>
    );
}
