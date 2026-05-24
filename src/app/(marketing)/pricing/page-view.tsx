import { PricingPageClient } from "@/components/marketing/pricing-client";
import { FAQPageJsonLd, PricingPlansJsonLd } from "@/components/seo/json-ld";
import { SIGNUP_URL } from "@/config/env";
import type { Plan } from "@/services/stripe/plans";

const PRICING_FAQS = [
    {
        question: "How does the 7-day free trial work?",
        answer:
            "Sign up for Starter or Professional and get full access to every feature for 7 days. Cancel before the trial ends and you won't be charged. No credit card lock-in, no annual contracts.",
    },
    {
        question: "What happens at the end of the trial?",
        answer:
            "After 7 days your subscription starts automatically. You'll receive an email reminder 24 hours before your trial ends. Cancel anytime before that and you won't be charged anything.",
    },
    {
        question: "Can I switch plans?",
        answer:
            "Yes—upgrade or downgrade anytime from your billing settings. Upgrades take effect immediately. Downgrades take effect at the next billing cycle.",
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
            "Absolutely. Cancel anytime from your billing settings—no cancellation fees, no contracts, no questions asked.",
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
