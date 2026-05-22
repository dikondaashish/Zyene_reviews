import type { MetadataRoute } from "next";

const BASE_URL = "https://zyenereviews.com";

/**
 * Next.js robots.txt generation.
 * Automatically served at /robots.txt.
 *
 * Rules:
 * - All marketing / docs / legal content is fully crawlable
 * - Internal API routes, admin paths, and Next.js internals are blocked
 * - The app subdomain (app.zyenereviews.com) has its own robots.txt on that host
 * - collectratings.com (review collection domain) has its own rules
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: [
                    "/",
                    "/about",
                    "/contact",
                    "/help",
                    "/docs",
                    "/docs/",
                    "/privacy",
                    "/terms",
                    "/data-retention",
                    // Phase 2 pages — pre-listed so Googlebot allows immediately on deploy
                    "/pricing",
                    "/features",
                    "/how-it-works",
                    "/integrations",
                    // Phase 3 pages
                    "/industries",
                    "/industries/",
                    "/compare",
                    "/compare/",
                    // Phase 4+ content
                    "/blog",
                    "/blog/",
                    "/resources",
                    "/resources/",
                    "/customers",
                    "/customers/",
                    "/security",
                    // Phase 5 — trust & social proof
                    "/case-studies",
                    "/case-studies/",
                    "/partners",
                    "/agencies",
                ],
                disallow: [
                    "/api/",
                    "/onboarding",
                    "/dashboard",
                    "/settings",
                    "/businesses",
                    "/reviews",
                    "/campaigns",
                    "/analytics",
                    "/competitors",
                    "/customers/import",
                    "/review-requests",
                    "/requests",
                    "/questions",
                    "/google-seo-aeo",
                    "/settings/integrations",
                    "/settings/integrations/zapier",
                    "/_next/",
                    "/favicon_io/",
                ],
            },
            // Block GPTBot / AI crawlers from indexing private content
            // while still allowing marketing pages to be read for brand presence
            {
                userAgent: "GPTBot",
                allow: ["/", "/about", "/docs", "/privacy", "/terms"],
                disallow: ["/api/", "/onboarding", "/dashboard"],
            },
            {
                userAgent: "CCBot",
                disallow: ["/"],
            },
            {
                userAgent: "anthropic-ai",
                allow: ["/", "/about", "/docs", "/privacy", "/terms"],
                disallow: ["/api/", "/onboarding", "/dashboard"],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
        host: BASE_URL,
    };
}
