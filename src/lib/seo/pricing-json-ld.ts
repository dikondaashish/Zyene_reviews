import { PLANS } from "@/services/stripe/plans";
import { buildOrganizationSchema } from "@/lib/seo/organization-schema";
import { JSON_LD_BASE_URL } from "@/components/seo/json-ld-constants";

const organizationSeller = buildOrganizationSchema();

const PRICING_URL = `${JSON_LD_BASE_URL}/pricing`;

function monthlyPlanOffer(planId: string) {
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

/** Product + Offer JSON-LD for Starter, Professional, and Enterprise (monthly list prices). */
export function buildPricingProductSchema(): Record<string, unknown> {
    const starter = monthlyPlanOffer("starter_monthly");
    const professional = monthlyPlanOffer("professional_monthly");
    const enterprise = PLANS.find((p) => p.id === "enterprise")!;

    const offers = [
        starter,
        professional,
        {
            "@type": "Offer",
            name: enterprise.name,
            description: enterprise.features.join("; "),
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: PRICING_URL,
            seller: organizationSeller,
        },
    ].filter(Boolean);

    return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Zyene Reviews",
        description:
            "Review management and local SEO platform for local businesses. Plans include review monitoring, AI replies, campaigns, and competitor tracking.",
        brand: {
            "@type": "Brand",
            name: "Zyene Reviews",
        },
        offers,
    };
}
