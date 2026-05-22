import type { MetadataRoute } from "next";
import { BLOG_SLUGS } from "@/lib/phase4/blog-data";
import { RESOURCE_SLUGS } from "@/lib/phase4/resource-data";
import { HELP_SLUGS } from "@/lib/phase4/help-data";

const BASE_URL = "https://zyenereviews.com";

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
    const now = new Date();

    // ─────────────────────────────────────────────
    // 1. Core marketing pages (already live)
    // ─────────────────────────────────────────────
    const corePages: MetadataRoute.Sitemap = [
        {
            url: `${BASE_URL}/`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/about`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/contact`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/help`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.7,
        },
    ];

    // ─────────────────────────────────────────────
    // 2. Conversion pages — Phase 2 (live)
    // ─────────────────────────────────────────────
    const conversionPages: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
        { url: `${BASE_URL}/features`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
        { url: `${BASE_URL}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
        { url: `${BASE_URL}/integrations`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    ];

    // ─────────────────────────────────────────────
    // 3. Industry verticals — Phase 3 (live)
    // ─────────────────────────────────────────────
    const industryPages: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/industries`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
        { url: `${BASE_URL}/industries/restaurants`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
        { url: `${BASE_URL}/industries/dental`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
        { url: `${BASE_URL}/industries/auto-repair`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
        { url: `${BASE_URL}/industries/salons`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
        { url: `${BASE_URL}/industries/home-services`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
        { url: `${BASE_URL}/industries/medical`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
        { url: `${BASE_URL}/industries/hotels`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
        { url: `${BASE_URL}/industries/fitness`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ];

    // ─────────────────────────────────────────────
    // 4. Comparison pages — Phase 3 (live)
    // ─────────────────────────────────────────────
    const comparePages: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/compare`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
        { url: `${BASE_URL}/compare/birdeye`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
        { url: `${BASE_URL}/compare/podium`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
        { url: `${BASE_URL}/compare/nicejob`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
        { url: `${BASE_URL}/compare/gatherup`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ];

    // ─────────────────────────────────────────────
    // 5. Developer docs (all live)
    // ─────────────────────────────────────────────
    const docPages: MetadataRoute.Sitemap = [
        {
            url: `${BASE_URL}/docs`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/docs/quickstart`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.75,
        },
        {
            url: `${BASE_URL}/docs/install`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.65,
        },
        {
            url: `${BASE_URL}/docs/how-it-works`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/docs/graph`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/docs/content-types`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/docs/sync`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.65,
        },
        {
            url: `${BASE_URL}/docs/api`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.75,
        },
        {
            url: `${BASE_URL}/docs/cookbook`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.65,
        },
        {
            url: `${BASE_URL}/docs/plugins`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.65,
        },
        {
            url: `${BASE_URL}/docs/changelog`,
            lastModified: now,
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
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.4,
        },
        {
            url: `${BASE_URL}/terms`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.4,
        },
        {
            url: `${BASE_URL}/data-retention`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.3,
        },
    ];

    // ─────────────────────────────────────────────
    // 7. Blog — Phase 4
    // ─────────────────────────────────────────────
    const blogPages: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
        ...BLOG_SLUGS.map((slug) => ({
            url: `${BASE_URL}/blog/${slug}`,
            lastModified: now,
            changeFrequency: "monthly" as const,
            priority: 0.75,
        })),
    ];

    // ─────────────────────────────────────────────
    // 8. Resource Guides — Phase 4
    // ─────────────────────────────────────────────
    const resourcePages: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/resources`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
        ...RESOURCE_SLUGS.map((slug) => ({
            url: `${BASE_URL}/resources/${slug}`,
            lastModified: now,
            changeFrequency: "monthly" as const,
            priority: 0.75,
        })),
    ];

    // ─────────────────────────────────────────────
    // 9. Help Center Articles — Phase 4
    // ─────────────────────────────────────────────
    const helpPages: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/help`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
        ...HELP_SLUGS.map((slug) => ({
            url: `${BASE_URL}/help/${slug}`,
            lastModified: now,
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
        ...docPages,
        ...legalPages,
    ];
}
