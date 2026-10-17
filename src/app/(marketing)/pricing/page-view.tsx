import { TRIAL_DETAILS } from "@/lib/marketing/trial-copy";
import { PricingPageClient } from "@/components/marketing/pricing-client";
import { FAQPageJsonLd, PricingPlansJsonLd } from "@/components/seo/json-ld";
import { SIGNUP_URL } from "@/config/env";
import type { Plan } from "@/services/stripe/plans";

const PRICING_FAQS = [
    {
        question: "How does the 7-day free trial work?",
        answer: TRIAL_DETAILS,
    },
    {
        question: "What happens at the end of the trial?",
        answer:
            "Your selected subscription bills automatically after the trial unless you cancel in Billing. Check the price, billing period and any special-offer terms shown at checkout.",
    },
    {
        question: "Can I switch plans?",
        answer:
            "Yes. Upgrade or downgrade anytime from your billing settings. Upgrades take effect immediately. Downgrades take effect at the next billing cycle.",
    },
    {
        question: "Can I manage multiple locations?",
        answer:
            "Starter covers 1 location. Professional covers up to 3 locations with independent limits per location. Enterprise offers unlimited locations.",
    },
    {
        question: "Do you offer annual billing?",
        answer:
            "Yes. Annual billing saves approximately 17% compared to monthly billing. You can switch from monthly to annual at any time.",
    },
    {
        question: "Can I cancel anytime?",
        answer:
            "Absolutely. Cancel anytime from your billing settings. No cancellation fees, no contracts, no questions asked.",
    },
];

export default function PricingPageView({
    starterMonthly,
    starterYearly,
    proMonthly,
    proYearly,
    enterprise,
}: {
    starterMonthly: Plan;
    starterYearly: Plan;
    proMonthly: Plan;
    proYearly: Plan;
    enterprise: Plan;
}) {
    return (
        <>
            <FAQPageJsonLd faqs={PRICING_FAQS} />
            <PricingPlansJsonLd />
            <PricingPageClient
                starterMonthly={starterMonthly}
                starterYearly={starterYearly}
                proMonthly={proMonthly}
                proYearly={proYearly}
                enterprise={enterprise}
                signupUrl={SIGNUP_URL}
            />
        </>
    );
}
