import type { FaqItem } from "@/components/seo/json-ld";
import type { FeaturePillarSlug } from "@/lib/growth/feature-pillars";
import { HEALTH_PAGE_CONTENT } from "@/lib/industries/industry-page-content-health";
import { HOSPITALITY_PAGE_CONTENT } from "@/lib/industries/industry-page-content-hospitality";
import { TRADES_PAGE_CONTENT } from "@/lib/industries/industry-page-content-trades";

/** Existing product mocks an industry page can lead with; see industry-lead-visual.tsx. */
export type IndustryVisual =
    | { kind: "qr-poster" | "attention-drafts" | "tone-drafts" | "request-triggers" | "auto-reply" | "campaign-templates" }
    | { kind: "reviewed-drafts"; business: string; reviewer: string; review: string; draft: string }
    | { kind: "job-webhook"; business: string; job: string; customer: string };

/**
 * Per-industry page structure, so the 11 industry pages do not share headings,
 * visuals or FAQs. Long-form pain points and solutions stay in industry-data.ts.
 */
export interface IndustryPageContent {
    headings: { pain: string; painLede: string; solve: string; useCase: string; pricing: string; faq: string };
    lead: {
        title: string;
        description: string;
        visual: IndustryVisual;
        visualLabel: string;
        link: { label: string; href: string };
        /** Index in IndustryData.solutions this lead covers, so it is not listed twice. */
        replacesSolution?: number;
    };
    /** 2-3 feature pages; rendered as links here and as "Popular in your industry" on each feature page. */
    relatedPillars: FeaturePillarSlug[];
    faqs: FaqItem[];
}

export const INDUSTRY_PAGE_CONTENT: Record<string, IndustryPageContent> = {
    ...HOSPITALITY_PAGE_CONTENT,
    ...HEALTH_PAGE_CONTENT,
    ...TRADES_PAGE_CONTENT,
};

/** Industry slugs whose pages list this feature, for cross-links on feature pages. */
export function getIndustrySlugsForPillar(pillar: FeaturePillarSlug): string[] {
    return Object.entries(INDUSTRY_PAGE_CONTENT)
        .filter(([, content]) => content.relatedPillars.includes(pillar))
        .map(([slug]) => slug);
}
