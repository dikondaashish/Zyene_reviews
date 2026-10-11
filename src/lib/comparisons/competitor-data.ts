import { VERIFIED_COMPETITOR_FACTS, COMPETITOR_FACTS_CHECKED_ON, STARTER_REQUEST_ALLOWANCE } from "@/lib/comparisons/verified-competitor-facts";
import type { FaqItem } from "@/components/seo/json-ld";
import { prosperlyComparison } from "@/lib/comparisons/competitor-data-prosperly";

export interface FeatureRow {
    feature: string;
    zyene: string | boolean;
    competitor: string | boolean;
    note?: string;
}

export interface CompetitorData {
    slug: string;
    name: string;
    price: string;
    priceNote: string;
    contractRequired: boolean;
    keyAngle: string;
    heroSub: string;
    metaTitle: string;
    metaDescription: string;
    targetKeywords: string[];
    winsForCompetitor: string[];
    winsForZyene: string[];
    quickTable: FeatureRow[];
    featureBreakdown: FeatureRow[];
    whoShouldUseCompetitor: string[];
    whoShouldUseZyene: string[];
    accentColor: string;
    /** 50-70 word GEO summary: who should pick Zyene Reviews vs this competitor. */
    openingSummary?: string;
    /** Optional deep-dive article (uncopyable asset) linked from compare hero. */
    deepDiveLink?: { label: string; href: string };
    /** A current plan-terms sentence used instead of making a contract inference. */
    billingTerms?: string;
    /** Public competitor pricing source shown on the comparison page. */
    pricingSource?: { label: string; href: string; checkedOn: string };
    faqs?: FaqItem[];
}

const BASE_COMPETITORS: CompetitorData[] = [
{
    "slug": "birdeye",
    "name": "Birdeye",
    "price": "Custom quote",
    "priceNote": "Pricing depends on products, locations and contract structure. Request a written quote.",
    "contractRequired": false,
    "billingTerms": "Pricing depends on products, locations and contract structure. Request a written quote.",
    "keyAngle": "Compare review workflows, allowances and the current Birdeye offer.",
    "heroSub": "Compare Zyene Reviews and Birdeye using current public pricing and the workflows your team needs. Confirm plan-specific capabilities before subscribing.",
    "metaTitle": "Best Birdeye Alternative: Zyene Reviews vs Birdeye (2026)",
    "metaDescription": "Looking for a Birdeye alternative? Compare Zyene Reviews and Birdeye on pricing, review workflows, and plan allowances for local businesses. From $29.99/mo.",
    "targetKeywords": [
        "birdeye alternative",
        "birdeye alternatives",
        "zyene vs birdeye",
        "alternatives to birdeye",
        "birdeye competitors"
    ],
    "winsForCompetitor": [
        "Modular reviews, listings, messaging and AI discovery products",
        "Per-location pricing based on the selected scope"
    ],
    "winsForZyene": [
        "Review inbox, customer feedback and request campaigns in one workspace",
        "Starter plan with published monthly request allowances"
    ],
    "quickTable": [],
    "featureBreakdown": [
        { "feature": "Location and billing scope", "zyene": "Starter: one location; other plans on pricing page", "competitor": "Confirm location count, term and total cost" },
        { "feature": "Integration compatibility", "zyene": "Check the available integrations and access requirements", "competitor": "Confirm your CRM/POS and supported actions" },
        { "feature": "Migration and exports", "zyene": "CSV customer import and data exports", "competitor": "Ask for an export and migration demonstration" }
    ],
    "whoShouldUseCompetitor": [
        "Teams whose required integrations and workflows are included in a confirmed vendor offer."
    ],
    "whoShouldUseZyene": [
        "Local businesses evaluating a shared review inbox and request workflow with published plan allowances."
    ],
    "accentColor": "blue",
    "openingSummary": "Use the same location count, sending volume and billing period when comparing offers. Birdeye and Zyene Reviews package capabilities differently; the lowest headline price does not establish feature equivalence. Verify the integrations and reply actions your team needs in a trial or demonstration, then compare the complete subscription cost."
},
{
    "slug": "podium",
    "name": "Podium",
    "price": "Custom quote",
    "priceNote": "Podium requests your industry to prepare a custom quote. Confirm included products and contract terms.",
    "contractRequired": false,
    "billingTerms": "Podium requests your industry to prepare a custom quote. Confirm included products and contract terms.",
    "keyAngle": "Compare review workflows, allowances and the current Podium offer.",
    "heroSub": "Compare Zyene Reviews and Podium using current public pricing and the workflows your team needs. Confirm plan-specific capabilities before subscribing.",
    "metaTitle": "Best Podium Alternative: Zyene Reviews vs Podium (2026)",
    "metaDescription": "Looking for a Podium alternative? Compare Zyene Reviews and Podium on pricing, review workflows, and messaging for local businesses. From $29.99/mo.",
    "targetKeywords": [
        "podium alternative",
        "podium vs birdeye",
        "zyene vs podium",
        "podium pricing",
        "podium cost"
    ],
    "winsForCompetitor": [
        "Industry-specific plans for local-business communication",
        "AI lead conversion and communication tools"
    ],
    "winsForZyene": [
        "Review inbox, customer feedback and request campaigns in one workspace",
        "Starter plan with published monthly request allowances"
    ],
    "quickTable": [],
    "featureBreakdown": [
        { "feature": "Location and billing scope", "zyene": "Starter: one location; other plans on pricing page", "competitor": "Confirm location count, term and total cost" },
        { "feature": "Integration compatibility", "zyene": "Check the available integrations and access requirements", "competitor": "Confirm your CRM/POS and supported actions" },
        { "feature": "Migration and exports", "zyene": "CSV customer import and data exports", "competitor": "Ask for an export and migration demonstration" }
    ],
    "whoShouldUseCompetitor": [
        "Teams whose required integrations and workflows are included in a confirmed vendor offer."
    ],
    "whoShouldUseZyene": [
        "Local businesses evaluating a shared review inbox and request workflow with published plan allowances."
    ],
    "accentColor": "blue",
    "deepDiveLink": {
        "label": "Read the complete Podium pricing breakdown (2026)",
        "href": "/blog/podium-pricing-vs-zyene-reviews"
    },
    "openingSummary": "Use the same location count, sending volume and billing period when comparing offers. Podium and Zyene Reviews package capabilities differently; the lowest headline price does not establish feature equivalence. Verify the integrations and reply actions your team needs in a trial or demonstration, then compare the complete subscription cost."
},
{
    "slug": "nicejob",
    "name": "NiceJob",
    "price": "$75",
    "priceNote": "Starter is listed at $75/month USD; Pro at $125/month USD. Website services are priced separately.",
    "contractRequired": false,
    "billingTerms": "Starter is listed at $75/month USD; Pro at $125/month USD. Website services are priced separately.",
    "keyAngle": "Compare review workflows, allowances and the current NiceJob offer.",
    "heroSub": "Compare Zyene Reviews and NiceJob using current public pricing and the workflows your team needs. Confirm plan-specific capabilities before subscribing.",
    "metaTitle": "NiceJob Alternative: Zyene Reviews vs NiceJob (2026)",
    "metaDescription": "Compare Zyene Reviews and NiceJob: pricing, automated review requests, AI replies, and which fits local service businesses. Zyene from $29.99/mo.",
    "targetKeywords": [
        "nicejob alternative",
        "nicejob alternatives",
        "zyene vs nicejob",
        "nicejob competitors",
        "yotpo vs nicejob"
    ],
    "winsForCompetitor": [
        "Automated review requests and social sharing",
        "Pro includes repeat-business campaigns and automated AI replies"
    ],
    "winsForZyene": [
        "Review inbox, customer feedback and request campaigns in one workspace",
        "Starter plan with published monthly request allowances"
    ],
    "quickTable": [],
    "featureBreakdown": [
        { "feature": "Location and billing scope", "zyene": "Starter: one location; other plans on pricing page", "competitor": "Confirm location count, term and total cost" },
        { "feature": "Integration compatibility", "zyene": "Check the available integrations and access requirements", "competitor": "Confirm your CRM/POS and supported actions" },
        { "feature": "Migration and exports", "zyene": "CSV customer import and data exports", "competitor": "Ask for an export and migration demonstration" }
    ],
    "whoShouldUseCompetitor": [
        "Teams whose required integrations and workflows are included in a confirmed vendor offer."
    ],
    "whoShouldUseZyene": [
        "Local businesses evaluating a shared review inbox and request workflow with published plan allowances."
    ],
    "accentColor": "blue",
    "openingSummary": "Use the same location count, sending volume and billing period when comparing offers. NiceJob and Zyene Reviews package capabilities differently; the lowest headline price does not establish feature equivalence. Verify the integrations and reply actions your team needs in a trial or demonstration, then compare the complete subscription cost."
},
{
    "slug": "gatherup",
    "name": "GatherUp",
    "price": "$99",
    "priceNote": "Small Business is listed at $99/month for one location. Multi-location and annual pricing differ; verify the selected billing period.",
    "contractRequired": false,
    "billingTerms": "Small Business is listed at $99/month for one location. Multi-location and annual pricing differ; verify the selected billing period.",
    "keyAngle": "Compare review workflows, allowances and the current GatherUp offer.",
    "heroSub": "Compare Zyene Reviews and GatherUp using current public pricing and the workflows your team needs. Confirm plan-specific capabilities before subscribing.",
    "metaTitle": "GatherUp Alternative: Zyene Reviews vs GatherUp (2026)",
    "metaDescription": "Compare Zyene Reviews and GatherUp on pricing, SMS/email credits, review monitoring, and AI replies for local businesses. From $29.99/mo.",
    "targetKeywords": [
        "gatherup alternative",
        "zyene vs gatherup",
        "gatherup vs nicejob",
        "gatherup vs birdeye",
        "gatherup vs podium"
    ],
    "winsForCompetitor": [
        "Review monitoring, surveys and NPS",
        "Up to 300 SMS and 3,000 email credits per location each month"
    ],
    "winsForZyene": [
        "Review inbox, customer feedback and request campaigns in one workspace",
        "Starter plan with published monthly request allowances"
    ],
    "quickTable": [],
    "featureBreakdown": [
        { "feature": "Location and billing scope", "zyene": "Starter: one location; other plans on pricing page", "competitor": "Confirm location count, term and total cost" },
        { "feature": "Integration compatibility", "zyene": "Check the available integrations and access requirements", "competitor": "Confirm your CRM/POS and supported actions" },
        { "feature": "Migration and exports", "zyene": "CSV customer import and data exports", "competitor": "Ask for an export and migration demonstration" }
    ],
    "whoShouldUseCompetitor": [
        "Teams whose required integrations and workflows are included in a confirmed vendor offer."
    ],
    "whoShouldUseZyene": [
        "Local businesses evaluating a shared review inbox and request workflow with published plan allowances."
    ],
    "accentColor": "blue",
    "openingSummary": "Use the same location count, sending volume and billing period when comparing offers. GatherUp and Zyene Reviews package capabilities differently; the lowest headline price does not establish feature equivalence. Verify the integrations and reply actions your team needs in a trial or demonstration, then compare the complete subscription cost."
},
    prosperlyComparison,
];

export const COMPETITORS: CompetitorData[] = BASE_COMPETITORS.map((entry) => {
    const facts = VERIFIED_COMPETITOR_FACTS[entry.slug as keyof typeof VERIFIED_COMPETITOR_FACTS];
    if (!facts) return entry;
    return { ...entry, price: facts.price, priceNote: facts.pricingNote, billingTerms: facts.terms,
        pricingSource: { label: `${facts.name} official pricing`, href: facts.source, checkedOn: COMPETITOR_FACTS_CHECKED_ON },
        whoShouldUseCompetitor: [facts.bestFor], quickTable: [
            { feature: "Starting monthly price", zyene: "Starter: $29.99/month", competitor: facts.price },
            { feature: "Included sending volume", zyene: STARTER_REQUEST_ALLOWANCE, competitor: facts.sending },
            { feature: "Business reply tools", zyene: "AI drafts + optional automatic Google replies", competitor: facts.aiReplies },
            { feature: "Competitor tracking", zyene: "Included in paid plans", competitor: facts.competitorTracking },
        ] };
});

export const COMPETITOR_MAP: Record<string, CompetitorData> = Object.fromEntries(COMPETITORS.map((c) => [c.slug, c]));
export const COMPETITOR_SLUGS = COMPETITORS.map((c) => c.slug);
