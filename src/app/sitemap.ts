import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/content/blog-data";
import { RESOURCE_GUIDES } from "@/lib/content/resource-data";
import {
    HELP_ARTICLE_MAP,
    HELP_CATEGORY_SLUGS,
    helpArticleNestedPath,
} from "@/lib/content/help-data";
import { CASE_STUDY_SLUGS } from "@/lib/social-proof/case-study-data";
import { FREE_TOOLS } from "@/lib/free-tools/free-tools-data";
import { FEATURE_PILLAR_SLUGS } from "@/lib/growth/feature-pillars";
import { LOCALIZED_INDUSTRY_PAGES } from "@/lib/industries/localized-industries";
import { MARKETING_SITE_ORIGIN } from "@/lib/seo/marketing-site-url";

const BASE_URL = MARKETING_SITE_ORIGIN;

/**
 * Next.js dynamic sitemap.
 * Automatically served at /sitemap.xml.
 *
 * Priority guide:
 *  1.0  Homepage
 *  0.9  Core conversion pages (pricing, features, how-it-works)
 *  0.8  Docs index + industry hub + compare hub
 *  0.7  Individual docs pages + industry verticals + comparison pages
 *  0.6  About, contact, help
 *  0.5  Blog / resource index (when live)
 *  0.4  Legal
 *  0.3  Data retention
 */
export default function sitemap(): MetadataRoute.Sitemap {
    // Omit unknown dates rather than claiming every page changed on each request.

    // ─────────────────────────────────────────────
    // 1. Core marketing pages (already live)
    // ─────────────────────────────────────────────
    const corePages: MetadataRoute.Sitemap = [
        {
            url: `${BASE_URL}/`,
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/about`,
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/contact`,
            changeFrequency: "monthly",
            priority: 0.6,
        },
    ];

    // ─────────────────────────────────────────────
    // 2. Conversion pages - Phase 2 (live)
    // ─────────────────────────────────────────────
    const conversionPages: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/pricing`, changeFrequency: "weekly", priority: 0.95 },
        { url: `${BASE_URL}/features`, changeFrequency: "weekly", priority: 0.9 },
        ...FEATURE_PILLAR_SLUGS.map((slug) => ({
            url: `${BASE_URL}/features/${slug}`,
            changeFrequency: "monthly" as const,
            priority: 0.8,
        })),
        { url: `${BASE_URL}/how-it-works`, changeFrequency: "monthly", priority: 0.85 },
        { url: `${BASE_URL}/integrations`, changeFrequency: "monthly", priority: 0.85 },
    ];

    // ─────────────────────────────────────────────
    // 3. Industry verticals - Phase 3 (live)
    // ─────────────────────────────────────────────
    const industryPages: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/industries`, changeFrequency: "monthly", priority: 0.8 },
        { url: `${BASE_URL}/industries/restaurants`, changeFrequency: "monthly", priority: 0.75 },
        { url: `${BASE_URL}/industries/dental`, changeFrequency: "monthly", priority: 0.75 },
        { url: `${BASE_URL}/industries/auto-repair`, changeFrequency: "monthly", priority: 0.75 },
        { url: `${BASE_URL}/industries/salons`, changeFrequency: "monthly", priority: 0.75 },
        { url: `${BASE_URL}/industries/home-services`, changeFrequency: "monthly", priority: 0.75 },
        { url: `${BASE_URL}/industries/medical`, changeFrequency: "monthly", priority: 0.75 },
        { url: `${BASE_URL}/industries/hotels`, changeFrequency: "monthly", priority: 0.75 },
        { url: `${BASE_URL}/industries/fitness`, changeFrequency: "monthly", priority: 0.7 },
    ];

    // 4. Comparison pages - Phase 3 (live)
    // ─────────────────────────────────────────────
    const comparePages: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/compare`, changeFrequency: "monthly", priority: 0.8 },
        { url: `${BASE_URL}/compare/birdeye`, changeFrequency: "monthly", priority: 0.8 },
        { url: `${BASE_URL}/compare/podium`, changeFrequency: "monthly", priority: 0.75 },
        { url: `${BASE_URL}/compare/nicejob`, changeFrequency: "monthly", priority: 0.75 },
        { url: `${BASE_URL}/compare/gatherup`, changeFrequency: "monthly", priority: 0.7 },
        { url: `${BASE_URL}/compare/prosperly`, changeFrequency: "monthly", priority: 0.7 },
    ];

    // ─────────────────────────────────────────────
    // 5. Developer docs (all live)
    // ─────────────────────────────────────────────
    const docPages: MetadataRoute.Sitemap = [
        {
            url: `${BASE_URL}/docs`,
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/docs/quickstart`,
            changeFrequency: "weekly",
            priority: 0.75,
        },
        {
            url: `${BASE_URL}/docs/install`,
            changeFrequency: "monthly",
            priority: 0.65,
        },
        {
            url: `${BASE_URL}/docs/how-it-works`,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/docs/graph`,
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/docs/content-types`,
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/docs/sync`,
            changeFrequency: "monthly",
            priority: 0.65,
        },
        {
            url: `${BASE_URL}/docs/api`,
            changeFrequency: "weekly",
            priority: 0.75,
        },
        {
            url: `${BASE_URL}/docs/cookbook`,
            changeFrequency: "monthly",
            priority: 0.65,
        },
        {
            url: `${BASE_URL}/docs/plugins`,
            changeFrequency: "monthly",
            priority: 0.65,
        },
        {
            url: `${BASE_URL}/docs/changelog`,
            changeFrequency: "weekly",
            priority: 0.55,
        },
    ];

    // ─────────────────────────────────────────────
    // 6. Legal / compliance pages
    // ─────────────────────────────────────────────
    const legalPages: MetadataRoute.Sitemap = [
        {
            url: `${BASE_URL}/privacy`,
            changeFrequency: "yearly",
            priority: 0.4,
        },
        {
            url: `${BASE_URL}/terms`,
            changeFrequency: "yearly",
            priority: 0.4,
        },
        {
            url: `${BASE_URL}/data-retention`,
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/security`,
            changeFrequency: "yearly",
            priority: 0.55,
        },
    ];

    // ─────────────────────────────────────────────
    // 10. Enterprise & agencies - Phase 8
    // ─────────────────────────────────────────────
    const enterprisePages: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/demo`, changeFrequency: "monthly", priority: 0.75 },
        { url: `${BASE_URL}/enterprise`, changeFrequency: "monthly", priority: 0.8 },
        { url: `${BASE_URL}/agencies`, changeFrequency: "monthly", priority: 0.75 },
        { url: `${BASE_URL}/es/industries`, changeFrequency: "monthly", priority: 0.7 },
        ...LOCALIZED_INDUSTRY_PAGES.map((p) => ({
            url: `${BASE_URL}/es/industries/${p.localizedSlug}`,
            changeFrequency: "monthly" as const,
            priority: 0.65,
        })),
    ];

    // ─────────────────────────────────────────────
    // 11. Free tools - Phase 7
    // ─────────────────────────────────────────────
    const toolPages: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/tools`, changeFrequency: "weekly", priority: 0.8 },
        ...FREE_TOOLS.map((tool) => ({
            url: `${BASE_URL}/tools/${tool.slug}`,
            changeFrequency: "monthly" as const,
            priority: 0.75,
        })),
    ];

    // ─────────────────────────────────────────────
    // 11. Partners - Phase 6
    // ─────────────────────────────────────────────
    const partnerPages: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/partners`, changeFrequency: "monthly", priority: 0.7 },
    ];

    // ─────────────────────────────────────────────
    // 11. Case Studies - Phase 5
    // ─────────────────────────────────────────────
    const caseStudyPages: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/case-studies`, changeFrequency: "monthly", priority: 0.75 },
        ...CASE_STUDY_SLUGS.map((slug) => ({
            url: `${BASE_URL}/case-studies/${slug}`,
            changeFrequency: "monthly" as const,
            priority: 0.7,
        })),
    ];

    // ─────────────────────────────────────────────
    // 7. Blog - Phase 4
    // ─────────────────────────────────────────────
    const blogPages: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.85 },
        ...BLOG_POSTS.map((post) => ({
            url: `${BASE_URL}/blog/${post.slug}`,
            lastModified: post.dateModified ?? post.publishedAt,
            changeFrequency: "monthly" as const,
            priority: 0.75,
        })),
    ];

    // ─────────────────────────────────────────────
    // 8. Resource Guides - Phase 4
    // ─────────────────────────────────────────────
    const resourcePages: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/resources`, changeFrequency: "monthly", priority: 0.8 },
        ...RESOURCE_GUIDES.map((guide) => ({
            url: `${BASE_URL}/resources/${guide.slug}`,
            lastModified: guide.lastUpdated,
            changeFrequency: "monthly" as const,
            priority: 0.75,
        })),
    ];

    // ─────────────────────────────────────────────
    // 9. Help Center Articles - Phase 4
    // ─────────────────────────────────────────────
    const helpPages: MetadataRoute.Sitemap = [
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
    ];

    return [
        ...corePages,
        ...conversionPages,
        ...industryPages,
        ...comparePages,
        ...blogPages,
        ...resourcePages,
        ...helpPages,
        ...partnerPages,
        ...enterprisePages,
        ...toolPages,
        ...caseStudyPages,
        ...docPages,
        ...legalPages,
    ];
}
