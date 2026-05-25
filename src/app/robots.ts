import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { MARKETING_SITE_ORIGIN } from "@/lib/seo/marketing-site-url";

const AUTH_DISALLOW = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];

/**
 * Next.js robots.txt generation.
 * Automatically served at /robots.txt per host.
 *
 * - Marketing (www): crawlable public content; auth paths on apex/www disallowed
 * - auth.*: block all crawlers (login should not be indexed)
 * - app.*: separate host — disallow dashboard (marketing robots not used for app UX)
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
    const host = (await headers()).get("host")?.toLowerCase() ?? "";

    if (host.startsWith("auth.")) {
        return {
            rules: [{ userAgent: "*", disallow: AUTH_DISALLOW }],
        };
    }

    if (host.startsWith("app.")) {
        return {
            rules: [{ userAgent: "*", disallow: ["/"] }],
        };
    }

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
                    "/pricing",
                    "/features",
                    "/how-it-works",
                    "/integrations",
                    "/industries",
                    "/industries/",
                    "/compare",
                    "/compare/",
                    "/blog",
                    "/blog/",
                    "/resources",
                    "/resources/",
                    "/customers",
                    "/customers/",
                    "/security",
                    "/case-studies",
                    "/case-studies/",
                    "/partners",
                    "/tools",
                    "/agencies",
                    "/demo",
                    "/enterprise",
                    "/es",
                    "/es/",
                ],
                disallow: [
                    "/api/",
                    "/growth",
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
                    "/login",
                    "/signup",
                    "/forgot-password",
                    "/reset-password",
                    "/_next/",
                    "/favicon_io/",
                ],
            },
            {
                userAgent: "GPTBot",
                allow: ["/", "/about", "/docs", "/privacy", "/terms"],
                disallow: ["/api/", "/onboarding", "/dashboard", "/login", "/signup"],
            },
            {
                userAgent: "CCBot",
                disallow: ["/"],
            },
            {
                userAgent: "anthropic-ai",
                allow: ["/", "/about", "/docs", "/privacy", "/terms"],
                disallow: ["/api/", "/onboarding", "/dashboard", "/login", "/signup"],
            },
        ],
        sitemap: `${MARKETING_SITE_ORIGIN}/sitemap.xml`,
        host: MARKETING_SITE_ORIGIN,
    };
}
