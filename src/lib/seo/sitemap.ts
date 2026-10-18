/**
 * Source of truth for marketing sitemap URLs. Add new marketing pages here.
 *
 * Served by route handlers, not a metadata `sitemap.ts`: src/app/sitemap.xml/route.ts
 * (index) and src/app/sitemap/[file]/route.ts (/sitemap/<section>.xml). A metadata
 * sitemap would also claim /sitemap.xml and break `next dev`.
 */
import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/content/blog-data";
import { RESOURCE_GUIDES } from "@/lib/content/resource-data";
import {
    HELP_ARTICLE_MAP,
    HELP_CATEGORY_SLUGS,
    helpArticleNestedPath,
} from "@/lib/content/help-data";
import { FREE_TOOLS } from "@/lib/free-tools/free-tools-data";
import { FEATURE_PILLAR_SLUGS } from "@/lib/growth/feature-pillars";
import { INDUSTRY_SLUGS } from "@/lib/industries/industry-data";
import { COMPETITOR_SLUGS } from "@/lib/comparisons/competitor-data";
import { DOC_NAV_GROUPS } from "@/lib/docs/doc-nav";
import { MARKETING_SITE_ORIGIN } from "@/lib/seo/marketing-site-url";

const BASE_URL = MARKETING_SITE_ORIGIN;

export function getCoreSitemap(): MetadataRoute.Sitemap {
    return [
        { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1.0 },
        { url: `${BASE_URL}/pricing`, changeFrequency: "weekly", priority: 0.95 },
        { url: `${BASE_URL}/small-business`, changeFrequency: "monthly", priority: 0.85 },
        { url: `${BASE_URL}/agencies`, changeFrequency: "monthly", priority: 0.75 },
        { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
        { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.6 },
        { url: `${BASE_URL}/partners`, changeFrequency: "monthly", priority: 0.7 },
        { url: `${BASE_URL}/demo`, changeFrequency: "monthly", priority: 0.75 },
        { url: `${BASE_URL}/enterprise`, changeFrequency: "monthly", priority: 0.8 },
        { url: `${BASE_URL}/how-it-works`, changeFrequency: "monthly", priority: 0.85 },
        { url: `${BASE_URL}/integrations`, changeFrequency: "monthly", priority: 0.85 },
        { url: `${BASE_URL}/compare`, changeFrequency: "monthly", priority: 0.8 },
        ...COMPETITOR_SLUGS.map((slug) => ({
            url: `${BASE_URL}/compare/${slug}`,
            changeFrequency: "monthly" as const,
            priority: 0.75,
        })),
        { url: `${BASE_URL}/industries`, changeFrequency: "monthly", priority: 0.8 },
        ...INDUSTRY_SLUGS.map((slug) => ({
            url: `${BASE_URL}/industries/${slug}`,
            changeFrequency: "monthly" as const,
            priority: 0.75,
        })),
        { url: `${BASE_URL}/features`, changeFrequency: "weekly", priority: 0.9 },
        ...FEATURE_PILLAR_SLUGS.map((slug) => ({
            url: `${BASE_URL}/features/${slug}`,
            changeFrequency: "monthly" as const,
            priority: 0.8,
        })),
        { url: `${BASE_URL}/tools`, changeFrequency: "weekly", priority: 0.8 },
        ...FREE_TOOLS.map((tool) => ({
            url: `${BASE_URL}/tools/${tool.slug}`,
            changeFrequency: "monthly" as const,
            priority: 0.75,
        })),
        { url: `${BASE_URL}/resources`, changeFrequency: "monthly", priority: 0.8 },
        ...RESOURCE_GUIDES.map((guide) => ({
            url: `${BASE_URL}/resources/${guide.slug}`,
            lastModified: guide.lastUpdated,
            changeFrequency: "monthly" as const,
            priority: 0.75,
        })),
        { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.85 },
        ...BLOG_POSTS.map((post) => ({
            url: `${BASE_URL}/blog/${post.slug}`,
            lastModified: post.dateModified ?? post.publishedAt,
            changeFrequency: "monthly" as const,
            priority: 0.75,
        })),
        // Case studies are illustrative composites (robots noindex), so they stay out of the sitemap.
        { url: `${BASE_URL}/security`, changeFrequency: "yearly", priority: 0.55 },
        { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.4 },
        { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.4 },
        { url: `${BASE_URL}/data-retention`, changeFrequency: "yearly", priority: 0.3 },
        { url: `${BASE_URL}/sms-consent`, changeFrequency: "yearly", priority: 0.5 },
    ];
}

export function getSupportSitemap(): MetadataRoute.Sitemap {
    const docItems = DOC_NAV_GROUPS.flatMap((group) => group.items).filter(
        (item) => item.href !== "/docs",
    );

    return [
        { url: `${BASE_URL}/help`, changeFrequency: "monthly", priority: 0.7 },
        ...HELP_CATEGORY_SLUGS.map((cat) => ({
            url: `${BASE_URL}/help/${cat}`,
            changeFrequency: "monthly" as const,
            priority: 0.65,
        })),
        ...Object.values(HELP_ARTICLE_MAP).map((article) => ({
            url: `${BASE_URL}${helpArticleNestedPath(article)}`,
            changeFrequency: "monthly" as const,
            priority: 0.6,
        })),
        { url: `${BASE_URL}/docs`, changeFrequency: "weekly", priority: 0.8 },
        ...docItems.map((item) => ({
            url: `${BASE_URL}${item.href}`,
            changeFrequency: "monthly" as const,
            priority: 0.65,
        })),
    ];
}

export type SitemapSection = "core" | "support";

/** Per-section builders; each section is served at /sitemap/<section>.xml. */
export const SITEMAP_SECTIONS: Record<SitemapSection, () => MetadataRoute.Sitemap> = {
    core: getCoreSitemap,
    support: getSupportSitemap,
};

export const SITEMAP_SECTION_IDS = Object.keys(SITEMAP_SECTIONS) as SitemapSection[];

/** Every entry across all sections (used by coverage tests). */
export function getAllSitemapEntries(): MetadataRoute.Sitemap {
    return SITEMAP_SECTION_IDS.flatMap((id) => SITEMAP_SECTIONS[id]());
}
