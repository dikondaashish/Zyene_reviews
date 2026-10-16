// ─────────────────────────────────────────────────────────────────────────────
// Feature landing pages - GROWTH_BLUEPRINT §4.2 (/features/*)
// One page per product feature, grouped by category for the /features index.
// Entries live in feature-pillars-catalog-*.ts; page bodies live in
// src/components/marketing/feature-landing/content/.
// ─────────────────────────────────────────────────────────────────────────────

import { COLLECT_FEATURE_PILLARS } from "@/lib/growth/feature-pillars-catalog-collect";
import { INSIGHT_FEATURE_PILLARS } from "@/lib/growth/feature-pillars-catalog-insight";

export type FeaturePillarSlug =
    | "review-collection"
    | "review-page"
    | "qr-code-reviews"
    | "nfc-review-stands"
    | "review-requests"
    | "review-campaigns"
    | "customer-crm"
    | "review-monitoring"
    | "ai-replies"
    | "automatic-review-replies"
    | "analytics"
    | "smart-insights"
    | "competitor-tracking"
    | "local-seo"
    | "ai-visibility"
    | "review-widgets"
    | "multi-location";

export type FeatureCategory = "collect" | "respond" | "understand" | "visibility" | "grow";

export const FEATURE_CATEGORIES: { id: FeatureCategory; label: string; description: string }[] = [
    { id: "collect", label: "Collect reviews", description: "Make it easy for happy customers to say so." },
    { id: "respond", label: "Respond", description: "Every review answered, in your voice." },
    { id: "understand", label: "Understand", description: "See what is working and what to fix next." },
    { id: "visibility", label: "Get found", description: "Show up on Google and in AI answers." },
    { id: "grow", label: "Show off & scale", description: "Put reviews to work and run every location." },
];

/** Legacy slugs from early features pages - permanently redirected. */
export const FEATURE_PILLAR_ALIASES: Record<string, FeaturePillarSlug> = {
    "competitor-intelligence": "competitor-tracking",
    "feedback-shield": "review-collection",
};

export interface FeaturePillarPage {
    slug: FeaturePillarSlug;
    category: FeatureCategory;
    title: string;
    /** Short label for menus and cards. */
    navLabel: string;
    tagline: string;
    /** Bare title; the root layout appends " | Zyene Reviews". Keep ≤ 44 chars. */
    metaTitle: string;
    /** ≤ 160 chars. */
    metaDescription: string;
    bullets: string[];
    cta: { label: string; href: string };
    highlight?: boolean;
}

export const FEATURE_PILLARS: FeaturePillarPage[] = [...COLLECT_FEATURE_PILLARS, ...INSIGHT_FEATURE_PILLARS];

export const FEATURE_PILLAR_SLUGS = FEATURE_PILLARS.map((p) => p.slug);

export const FEATURE_PILLAR_MAP: Record<FeaturePillarSlug, FeaturePillarPage> = Object.fromEntries(
    FEATURE_PILLARS.map((p) => [p.slug, p])
) as Record<FeaturePillarSlug, FeaturePillarPage>;

export function resolveFeaturePillarSlug(segment: string): FeaturePillarSlug | null {
    if (segment in FEATURE_PILLAR_MAP) return segment as FeaturePillarSlug;
    return FEATURE_PILLAR_ALIASES[segment] ?? null;
}

export function featurePillarsByCategory(category: FeatureCategory): FeaturePillarPage[] {
    return FEATURE_PILLARS.filter((p) => p.category === category);
}
