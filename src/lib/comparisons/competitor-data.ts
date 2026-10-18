import type { FaqItem } from "@/components/seo/json-ld";
import type { SourcedDifference } from "@/lib/comparisons/competitor-fact-types";
import { COMPETITOR_FACT_SHEETS, STARTER_REQUEST_ALLOWANCE } from "@/lib/comparisons/verified-competitor-facts";
import type { FeaturePillarSlug } from "@/lib/growth/feature-pillars";
import { birdeyeComparison, podiumComparison } from "@/lib/comparisons/competitor-data-quoted";
import { gatherupComparison, nicejobComparison } from "@/lib/comparisons/competitor-data-published";
import { prosperlyComparison } from "@/lib/comparisons/competitor-data-prosperly";

export interface FeatureRow {
    feature: string;
    zyene: string | boolean;
    competitor: string | boolean;
    note?: string;
}

/** Existing Zyene product mocks a compare page can show; see compare-competitor-visual.tsx. */
export type CompetitorVisualKey = "auto-reply-rules" | "sms-request" | "request-triggers" | "competitor-board" | "review-inbox";

/** Page copy for one competitor. Prices, sources and differences come from the shared fact sheet. */
export interface CompetitorEntry {
    slug: string;
    name: string;
    /** One line for the /compare hub card. */
    keyAngle: string;
    heroSub: string;
    metaTitle: string;
    metaDescription: string;
    targetKeywords: string[];
    /** 50-70 word GEO summary: who should pick Zyene Reviews vs this competitor. */
    openingSummary: string;
    /** One honest sentence on when this competitor is the better choice. */
    pickCompetitorInstead: string;
    whoShouldUseCompetitor: string[];
    whoShouldUseZyene: string[];
    visual: { key: CompetitorVisualKey; title: string; caption: string };
    switching: { intro: string; steps: string[] };
    relatedPillars: FeaturePillarSlug[];
    faqs: FaqItem[];
    /** Overrides the quick table built from the fact sheet. */
    quickTable?: FeatureRow[];
    featureBreakdown?: FeatureRow[];
    /** Deep-dive articles linked from the page. */
    guides?: { label: string; href: string }[];
    accentColor: string;
}

export interface CompetitorData extends CompetitorEntry {
    price: string;
    priceNote: string;
    billingTerms: string;
    pricingSource: { label: string; href: string; checkedOn: string };
    differences: SourcedDifference[];
    quickTable: FeatureRow[];
}

const ENTRIES: CompetitorEntry[] = [birdeyeComparison, podiumComparison, nicejobComparison, gatherupComparison, prosperlyComparison];

export const COMPETITORS: CompetitorData[] = ENTRIES.map((entry) => {
    const facts = COMPETITOR_FACT_SHEETS[entry.slug];
    return {
        ...entry,
        price: facts.price,
        priceNote: facts.pricingNote,
        billingTerms: facts.terms,
        pricingSource: { label: `${facts.name} official pricing`, href: facts.source, checkedOn: facts.checkedOn },
        differences: facts.differences,
        quickTable: entry.quickTable ?? [
            { feature: "Starting monthly price", zyene: "Starter: $29.99/month", competitor: facts.price },
            { feature: "Included sending volume", zyene: STARTER_REQUEST_ALLOWANCE, competitor: facts.sending },
            { feature: "Business reply tools", zyene: "AI drafts + optional automatic Google replies", competitor: facts.aiReplies },
            { feature: "Competitor tracking", zyene: "Included in paid plans", competitor: facts.competitorTracking },
            { feature: "Free trial", zyene: "7 days; card required", competitor: facts.trial },
            { feature: "Billing terms", zyene: "Monthly or annual; no annual contract", competitor: facts.terms },
        ],
    };
});

export const COMPETITOR_MAP: Record<string, CompetitorData> = Object.fromEntries(COMPETITORS.map((c) => [c.slug, c]));
export const COMPETITOR_SLUGS = COMPETITORS.map((c) => c.slug);

/** Compare pages whose data lists this feature as related, for cross-links on feature pages. */
export function getComparisonsForPillar(pillar: FeaturePillarSlug): CompetitorData[] {
    return COMPETITORS.filter((c) => c.relatedPillars.includes(pillar));
}
