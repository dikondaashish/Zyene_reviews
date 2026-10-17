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
            "Zyene Reviews is a full-stack review management platform for local businesses. Monitor Google, Facebook, and Yelp reviews in one inbox. Respond with AI-generated replies in one click. Collect reviews via SMS, email, links, QR codes, and NFC review stands, with an AI-drafted review customers can edit and post. Collect private feedback for service recovery while keeping public review options available to everyone. Track competitors, improve your Google Business Profile, and see whether AI assistants mention your business.",
        screenshot: `${JSON_LD_BASE_URL}/og/zyene-reviews-share.jpg`,
        featureList: [
            "Review monitoring from Google, Facebook, Yelp",
            "AI-powered review reply suggestions in Professional, Friendly, or Concise tones",
            "Automatic replies to new Google reviews by star rating",
            "Branded review page with AI-drafted reviews customers can edit and post",
            "Printable QR codes and NFC review stands",
            "Negative Feedback Shield for private feedback and service recovery",
            "SMS, email, and link review requests and campaigns",
            "Customer list with notes and CSV import/export",
            "Smart Insights: review themes and suggested improvements",
            "Competitor tracking with AI market briefs and alerts",
            "Google Business Profile score, audit, and broken-link checks",
            "AI visibility tracking across ChatGPT, Perplexity, and Gemini",
            "Multi-location management",
            "REST API and Zapier-compatible webhooks",
            "Embeddable review widgets with 20 templates",
        ],
        offers: [monthlyPlanOffer("starter_monthly"), monthlyPlanOffer("professional_monthly")].filter(Boolean),
        publisher: {
            "@id": `${JSON_LD_BASE_URL}/#organization`,
        },
    };

    return <JsonLdScript schema={schema} />;
}
