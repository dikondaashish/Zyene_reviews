/**
 * Blog post type definitions — Phase 4.
 * Shared by blog post data modules and help-data (ContentSection).
 */

export type ContentPillar =
    | "google-reviews"
    | "responding-to-reviews"
    | "local-seo"
    | "reputation-management"
    | "industry-specific"
    | "competitor-analysis";

export type SectionType =
    | "h2"
    | "h3"
    | "p"
    | "summary"
    | "ul"
    | "ol"
    | "tip"
    | "warning"
    | "cta"
    | "quote"
    | "table";

/** FAQ entries for blog posts (visible Q&A + FAQPage JSON-LD). */
export interface BlogFaq {
    question: string;
    answer: string;
}

export interface TableData {
    headers: string[];
    rows: string[][];
}

export interface ContentSection {
    type: SectionType;
    text?: string;
    items?: string[];
    table?: TableData;
    ctaLabel?: string;
    ctaHref?: string;
}

export interface BlogAuthor {
    name: string;
    role: string;
    avatarUrl?: string;
}

export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    pillar: ContentPillar;
    pillarLabel: string;
    publishedAt: string;
    readMinutes: number;
    author: BlogAuthor;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    relatedSlugs: string[];
    internalLinks: Array<{ label: string; href: string }>;
    body: ContentSection[];
    /** Optional FAQs for on-page Q&A and FAQPage schema. */
    faqs?: BlogFaq[];
    /** ISO date when content was last substantively updated (Article dateModified). */
    dateModified?: string;
}
