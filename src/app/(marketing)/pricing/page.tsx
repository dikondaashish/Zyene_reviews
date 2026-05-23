import type { Metadata } from "next";
import { PLANS } from "@/services/stripe/plans";
import { PricingPageClient } from "@/components/marketing/pricing-client";
import { FAQPageJsonLd, ProductJsonLd } from "@/components/seo/json-ld";
import { SIGNUP_URL } from "@/config/env";

export const metadata: Metadata = {
    title: "Pricing, Zyene Reviews",
    description:
        "Zyene Reviews plans starting at $29.99/mo. No annual contracts. No hidden fees. 7-day free trial on every plan. Compare Starter, Professional, and Enterprise.",
    alternates: { canonical: "https://zyenereviews.com/pricing" },
    openGraph: {
        title: "Pricing, Zyene Reviews",
        description:
            "Plans starting at $29.99/mo. No annual contracts. 7-day free trial. Compare Starter, Professional, and Enterprise.",
        url: "https://zyenereviews.com/pricing",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Pricing, Zyene Reviews",
        description: "Plans starting at $29.99/mo. No annual contracts. 7-day free trial.",
    },
};

const PRICING_FAQS = [
    { question: "How does the 7-day free trial work?", answer: "Sign up for Starter or Professional and get full access to every feature for 7 days. Cancel before the trial ends and you won't be charged. No credit card lock-in, no annual contracts." },
    { question: "What happens at the end of the trial?", answer: "After 7 days your subscription starts automatically. You'll receive an email reminder 24 hours before your trial ends. Cancel anytime before that and you won't be charged anything." },
    { question: "Can I switch plans?", answer: "Yes ,  upgrade or downgrade anytime from your billing settings. Upgrades take effect immediately. Downgrades take effect at the next billing cycle." },
    { question: "Can I manage multiple locations?", answer: "Starter covers 1 location. Professional covers up to 3 locations with independent limits per location. Enterprise offers unlimited locations." },
    { question: "Do you offer annual billing?", answer: "Yes. Annual billing saves approximately 17% compared to monthly billing. You can switch from monthly to annual at any time." },
    { question: "Can I cancel anytime?", answer: "Absolutely. Cancel anytime from your billing settings ,  no cancellation fees, no contracts, no questions asked." },
];

export default function PricingPage() {
    const starterMonthly = PLANS.find((p) => p.id === "starter_monthly")!;
    const starterYearly = PLANS.find((p) => p.id === "starter_yearly")!;
    const proMonthly = PLANS.find((p) => p.id === "professional_monthly")!;
    const proYearly = PLANS.find((p) => p.id === "professional_yearly")!;
    const enterprise = PLANS.find((p) => p.id === "enterprise")!;

    return (
        <>
            {/* Structured data */}
            <FAQPageJsonLd faqs={PRICING_FAQS} />
            <ProductJsonLd
                name="Zyene Reviews ,  Starter Plan"
                description="Review management platform for single-location businesses. 500 email/SMS requests, 1,500 AI replies, competitor tracking, Developer API."
                price="29.99"
                url="https://zyenereviews.com/pricing"
            />

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
