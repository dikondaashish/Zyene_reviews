"use client";

import { useState } from "react";
import type { Plan } from "@/services/stripe/plans";
import { CustomerLogoBar, TestimonialGrid } from "@/components/marketing/social-proof";
import { PricingClientHeroSection } from "./pricing-client-hero-section";
import { PricingClientPlansSection } from "./pricing-client-plans-section";
import { PricingClientLocationScaleSection } from "./pricing-client-location-scale-section";
import { PricingClientComparisonSection } from "./pricing-client-comparison-section";
import { PricingClientFaqSection } from "./pricing-client-faq-section";
import { PricingClientFinalCtaSection } from "./pricing-client-final-cta-section";

export { BillingToggle } from "./pricing-client-billing-toggle";

export function PricingPageClient({
    starterMonthly,
    starterYearly,
    proMonthly,
    proYearly,
    enterprise,
    signupUrl,
}: {
    starterMonthly: Plan;
    starterYearly: Plan;
    proMonthly: Plan;
    proYearly: Plan;
    enterprise: Plan;
    signupUrl: string;
}) {
    const [interval, setInterval] = useState<"month" | "year">("month");

    const starter = interval === "month" ? starterMonthly : starterYearly;
    const pro = interval === "month" ? proMonthly : proYearly;

    return (
        <div className="flex flex-col w-full">
            <PricingClientHeroSection interval={interval} onIntervalChange={setInterval} />
            <CustomerLogoBar title="Trusted by local businesses on every plan" />
            <PricingClientPlansSection starter={starter} pro={pro} enterprise={enterprise} signupUrl={signupUrl} />
            <PricingClientLocationScaleSection />
            <PricingClientComparisonSection />
            <TestimonialGrid
                limit={3}
                title="Trusted by owners on every plan"
                subtitle="See how local businesses grew reviews and ratings with Zyene ,  full stories in our case studies."
            />
            <PricingClientFaqSection />
            <PricingClientFinalCtaSection signupUrl={signupUrl} />
        </div>
    );
}
