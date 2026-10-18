import { PricingPageClient } from "@/components/marketing/pricing-client";
import { PRICING_FAQS } from "@/components/marketing/pricing-client-constants";
import { FAQPageJsonLd, PricingPlansJsonLd } from "@/components/seo/json-ld";
import { SIGNUP_URL } from "@/config/env";
import type { Plan } from "@/services/stripe/plans";

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
            {/* Same list the visible FAQ renders, so the schema cannot drift from the page. */}
            <FAQPageJsonLd faqs={[...PRICING_FAQS]} />
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
