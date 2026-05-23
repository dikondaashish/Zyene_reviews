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
        operatingSystem: "Web, iOS, Android",
        browserRequirements: "Requires JavaScript. Modern browser recommended.",
        description:
            "Zyene Reviews is a full-stack review management platform for local businesses. Monitor Google, Facebook, and Yelp reviews in one inbox. Respond with AI-generated replies in one click. Automatically collect reviews via SMS, email, and shareable links. Route negative feedback privately before it hits Google. Track competitors and optimize your Google Business Profile for local SEO.",
        screenshot: `${JSON_LD_BASE_URL}/og/og-default.png`,
        featureList: [
            "Review monitoring from Google, Facebook, Yelp",
            "AI-powered review reply suggestions",
            "Auto-commenter for hands-free Google replies",
            "Negative Feedback Shield, private routing for 1-3 star feedback",
            "SMS, email, and link review request campaigns",
            "Competitor tracking with AI market briefs",
            "Google Business Profile SEO dashboard",
            "Keyword and performance analytics",
            "Multi-location management",
            "Zapier integration and REST API",
            "Embeddable review widgets",
        ],
        offers: [
            {
                "@type": "Offer",
                name: "Starter",
                price: "29.99",
                priceCurrency: "USD",
                priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    price: "29.99",
                    priceCurrency: "USD",
                    billingDuration: "P1M",
                    billingIncrement: 1,
                    unitText: "month",
                },
                description:
                    "Full review management platform for single-location businesses. Includes 500 email requests, 500 SMS requests, 1,500 AI replies/month, and 5 team seats.",
                availability: "https://schema.org/InStock",
                url: `${JSON_LD_BASE_URL}/#pricing`,
            },
            {
                "@type": "Offer",
                name: "Professional",
                price: "59.99",
                priceCurrency: "USD",
                priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    price: "59.99",
                    priceCurrency: "USD",
                    billingDuration: "P1M",
                    billingIncrement: 1,
                    unitText: "month",
                },
                description:
                    "Multi-location review management for up to 3 locations. Includes per-location request limits, 2,000 AI replies/month, and 15 team seats.",
                availability: "https://schema.org/InStock",
                url: `${JSON_LD_BASE_URL}/#pricing`,
            },
        ],
        publisher: {
            "@id": `${JSON_LD_BASE_URL}/#organization`,
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            reviewCount: "47",
            bestRating: "5",
            worstRating: "1",
        },
    };

    return <JsonLdScript schema={schema} />;
}
