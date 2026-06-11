import type { Metadata } from "next";
import { mergeMarketingSocial } from "@/lib/seo/marketing-page-metadata";
import { PLANS } from "@/services/stripe/plans";

export const metadata: Metadata = mergeMarketingSocial({
    title: "Pricing",
    description:
        "Zyene Reviews plans starting at $29.99/mo. No annual contracts. No hidden fees. 7-day free trial on every plan. Compare Starter, Professional, and Enterprise.",
    alternates: { canonical: "https://www.zyenereviews.com/pricing" },
    openGraph: {
        title: "Pricing",
        description:
            "Plans starting at $29.99/mo. No annual contracts. 7-day free trial. Compare Starter, Professional, and Enterprise.",
        url: "https://www.zyenereviews.com/pricing",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Pricing",
        description: "Plans starting at $29.99/mo. No annual contracts. 7-day free trial.",
    },
});

import PricingPageView from "./page-view";

export default function PricingPage() {
    const starterMonthly = PLANS.find((p) => p.id === "starter_monthly")!;
    const starterYearly = PLANS.find((p) => p.id === "starter_yearly")!;
    const proMonthly = PLANS.find((p) => p.id === "professional_monthly")!;
    const proYearly = PLANS.find((p) => p.id === "professional_yearly")!;
    const enterprise = PLANS.find((p) => p.id === "enterprise")!;

    return (
        <PricingPageView
            starterMonthly={starterMonthly}
            starterYearly={starterYearly}
            proMonthly={proMonthly}
            proYearly={proYearly}
            enterprise={enterprise}
        />
    );
}
