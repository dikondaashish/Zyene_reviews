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

export const COMPETITORS: CompetitorData[] = [
{
    "slug": "birdeye",
    "name": "Birdeye",
    "price": "Custom quote",
    "priceNote": "Pricing depends on products, locations and contract structure. Request a written quote.",
    "contractRequired": false,
    "billingTerms": "Pricing depends on products, locations and contract structure. Request a written quote.",
    "keyAngle": "Compare review workflows, allowances and the current Birdeye offer.",
    "heroSub": "Compare Zyene Reviews and Birdeye using current public pricing and the workflows your team needs. Confirm plan-specific capabilities before subscribing.",
    "metaTitle": "Zyene Reviews vs Birdeye: Pricing and Features",
    "metaDescription": "Compare Zyene Reviews and Birdeye: public pricing, review workflows, plan allowances and questions to ask before choosing a platform.",
    "targetKeywords": [
        "zyene vs birdeye",
        "birdeye alternative"
    ],
    "winsForCompetitor": [
        "Modular reviews, listings, messaging and AI discovery products",
        "Per-location pricing based on the selected scope"
    ],
    "winsForZyene": [
        "Review inbox, customer feedback and request campaigns in one workspace",
        "Starter plan with published monthly request allowances"
    ],
    "quickTable": [
        { "feature": "Starting price", "zyene": "Starter: $29.99/month", "competitor": "Custom quote" },
        { "feature": "Included sending volume", "zyene": "Starter: 50 SMS + 500 email requests/month", "competitor": "Check the selected plan" },
        { "feature": "Business reply tools", "zyene": "AI drafts and optional automatic replies", "competitor": "Confirm included plan and supported platforms" }
    ],
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
    "pricingSource": {
        "label": "Birdeye official pricing",
        "href": "https://birdeye.com/pricing/",
        "checkedOn": "September 12, 2026"
    },
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
    "metaTitle": "Zyene Reviews vs Podium: Pricing and Features",
    "metaDescription": "Compare Zyene Reviews and Podium: public pricing, review workflows, plan allowances and questions to ask before choosing a platform.",
    "targetKeywords": [
        "zyene vs podium",
        "podium alternative"
    ],
    "winsForCompetitor": [
        "Industry-specific plans for local-business communication",
        "AI lead conversion and communication tools"
    ],
    "winsForZyene": [
        "Review inbox, customer feedback and request campaigns in one workspace",
        "Starter plan with published monthly request allowances"
    ],
    "quickTable": [
        { "feature": "Starting price", "zyene": "Starter: $29.99/month", "competitor": "Custom quote" },
        { "feature": "Included sending volume", "zyene": "Starter: 50 SMS + 500 email requests/month", "competitor": "Check the selected plan" },
        { "feature": "Business reply tools", "zyene": "AI drafts and optional automatic replies", "competitor": "Confirm included plan and supported platforms" }
    ],
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
    "pricingSource": {
        "label": "Podium official pricing",
        "href": "https://www.podium.com/getpricing",
        "checkedOn": "September 12, 2026"
    },
    "openingSummary": "Use the same location count, sending volume and billing period when comparing offers. Podium and Zyene Reviews package capabilities differently; the lowest headline price does not establish feature equivalence. Verify the integrations and reply actions your team needs in a trial or demonstration, then compare the complete subscription cost."
},
{
    "slug": "nicejob",
    "name": "NiceJob",
    "price": "$75",
    "priceNote": "Reviews is listed at $75/month USD; Pro at $125/month USD. Website services are priced separately.",
    "contractRequired": false,
    "billingTerms": "Reviews is listed at $75/month USD; Pro at $125/month USD. Website services are priced separately.",
    "keyAngle": "Compare review workflows, allowances and the current NiceJob offer.",
    "heroSub": "Compare Zyene Reviews and NiceJob using current public pricing and the workflows your team needs. Confirm plan-specific capabilities before subscribing.",
    "metaTitle": "Zyene Reviews vs NiceJob: Pricing and Features",
    "metaDescription": "Compare Zyene Reviews and NiceJob: public pricing, review workflows, plan allowances and questions to ask before choosing a platform.",
    "targetKeywords": [
        "zyene vs nicejob",
        "nicejob alternative"
    ],
    "winsForCompetitor": [
        "Automated review requests and social sharing",
        "Pro includes repeat-business campaigns and automated AI replies"
    ],
    "winsForZyene": [
        "Review inbox, customer feedback and request campaigns in one workspace",
        "Starter plan with published monthly request allowances"
    ],
    "quickTable": [
        { "feature": "Starting price", "zyene": "Starter: $29.99/month", "competitor": "$75" },
        { "feature": "Included sending volume", "zyene": "Starter: 50 SMS + 500 email requests/month", "competitor": "Check the selected plan" },
        { "feature": "Business reply tools", "zyene": "AI drafts and optional automatic replies", "competitor": "Confirm included plan and supported platforms" }
    ],
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
    "pricingSource": {
        "label": "NiceJob official pricing",
        "href": "https://get.nicejob.com/pricing",
        "checkedOn": "September 12, 2026"
    },
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
    "metaTitle": "Zyene Reviews vs GatherUp: Pricing and Features",
    "metaDescription": "Compare Zyene Reviews and GatherUp: public pricing, review workflows, plan allowances and questions to ask before choosing a platform.",
    "targetKeywords": [
        "zyene vs gatherup",
        "gatherup alternative"
    ],
    "winsForCompetitor": [
        "Review monitoring, surveys and NPS",
        "Up to 300 SMS and 3,000 email credits per location each month"
    ],
    "winsForZyene": [
        "Review inbox, customer feedback and request campaigns in one workspace",
        "Starter plan with published monthly request allowances"
    ],
    "quickTable": [
        { "feature": "Starting price", "zyene": "Starter: $29.99/month", "competitor": "$99" },
        { "feature": "Included sending volume", "zyene": "Starter: 50 SMS + 500 email requests/month", "competitor": "Check the selected plan" },
        { "feature": "Business reply tools", "zyene": "AI drafts and optional automatic replies", "competitor": "Confirm included plan and supported platforms" }
    ],
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
    "pricingSource": {
        "label": "GatherUp official pricing",
        "href": "https://gatherup.com/pricing/",
        "checkedOn": "September 12, 2026"
    },
    "openingSummary": "Use the same location count, sending volume and billing period when comparing offers. GatherUp and Zyene Reviews package capabilities differently; the lowest headline price does not establish feature equivalence. Verify the integrations and reply actions your team needs in a trial or demonstration, then compare the complete subscription cost."
},
    prosperlyComparison,
];

export const COMPETITOR_MAP: Record<string, CompetitorData> = Object.fromEntries(COMPETITORS.map((c) => [c.slug, c]));
export const COMPETITOR_SLUGS = COMPETITORS.map((c) => c.slug);
