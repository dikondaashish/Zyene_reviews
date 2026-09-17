import { PLANS } from "@/services/stripe/plans";
import { buildOrganizationSchema } from "@/lib/seo/organization-schema";
import { JSON_LD_BASE_URL } from "@/components/seo/json-ld-constants";

const organizationSeller = buildOrganizationSchema();

const PRICING_URL = `${JSON_LD_BASE_URL}/pricing`;

export function monthlyPlanOffer(planId: string) {
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan || plan.price == null) return null;

    return {
        "@type": "Offer" as const,
        name: plan.name,
        description: plan.features.slice(0, 3).join("; "),
        price: plan.price.toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: PRICING_URL,
        seller: organizationSeller,
    };
}

/** Only advertise offers with a public price; Enterprise requires a custom quote. */
export function buildPricingProductSchema(): Record<string, unknown> {
    const starter = monthlyPlanOffer("starter_monthly");
    const professional = monthlyPlanOffer("professional_monthly");
    const offers = [starter, professional].filter(Boolean);

    return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Zyene Reviews",
        image: [`${JSON_LD_BASE_URL}/og/og-default.png`],
        url: PRICING_URL,
        description:
            "Review management and local SEO platform for local businesses. Plans include review monitoring, AI replies, campaigns, and competitor tracking.",
        brand: {
            "@type": "Brand",
            name: "Zyene Reviews",
        },
        offers,
    };
}
