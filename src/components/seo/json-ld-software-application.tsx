import { monthlyPlanOffer } from "@/lib/seo/pricing-json-ld";
import { JSON_LD_BASE_URL } from "./json-ld-constants";
import { JsonLdScript } from "./json-ld-script";

export function SoftwareApplicationJsonLd() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": `${JSON_LD_BASE_URL}/#software`,
        name: "Zyene Reviews",
        url: JSON_LD_BASE_URL,
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Reputation Management Software",
        operatingSystem: "Web",
        browserRequirements: "Requires JavaScript. Modern browser recommended.",
        description:
            "Zyene Reviews is a full-stack review management platform for local businesses. Monitor Google, Facebook, and Yelp reviews in one inbox. Respond with AI-generated replies in one click. Automatically collect reviews via SMS, email, and shareable links. Collect private feedback for service recovery while keeping public review options available to everyone. Track competitors and optimize your Google Business Profile for local SEO.",
        screenshot: `${JSON_LD_BASE_URL}/og/og-default.png`,
        featureList: [
            "Review monitoring from Google, Facebook, Yelp",
            "AI-powered review reply suggestions",
            "Auto-commenter for hands-free Google replies",
            "Negative Feedback Shield for private feedback and service recovery",
            "SMS, email, and link review request campaigns",
            "Competitor tracking with AI market briefs",
            "Google Business Profile SEO dashboard",
            "Keyword and performance analytics",
            "Multi-location management",
            "Zapier integration and REST API",
            "Embeddable review widgets",
        ],
        offers: [monthlyPlanOffer("starter_monthly"), monthlyPlanOffer("professional_monthly")].filter(Boolean),
        publisher: {
            "@id": `${JSON_LD_BASE_URL}/#organization`,
        },
    };

    return <JsonLdScript schema={schema} />;
}
