import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import {
    AI_CRAWLER_ALLOW,
    AI_CRAWLER_DISALLOW,
    MARKETING_ROBOTS_DISALLOW,
} from "@/lib/seo/robots-disallow-paths";
import { MARKETING_SITE_ORIGIN } from "@/lib/seo/marketing-site-url";

const AUTH_DISALLOW = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];

/**
 * Next.js robots.txt generation — served at /robots.txt per host.
 *
 * Marketing (www): allow public content; block app, auth, ops, and embed/capture routes.
 * auth.*: block all crawlers. app.*: block dashboard host.
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
                allow: ["/"],
                disallow: [...MARKETING_ROBOTS_DISALLOW],
            },
            {
                userAgent: "GPTBot",
                allow: [...AI_CRAWLER_ALLOW],
                disallow: [...AI_CRAWLER_DISALLOW],
            },
            {
                userAgent: "CCBot",
                disallow: ["/"],
            },
            {
                userAgent: "anthropic-ai",
                allow: [...AI_CRAWLER_ALLOW],
                disallow: [...AI_CRAWLER_DISALLOW],
            },
            {
                userAgent: "ClaudeBot",
                allow: [...AI_CRAWLER_ALLOW],
                disallow: [...AI_CRAWLER_DISALLOW],
            },
            {
                userAgent: "PerplexityBot",
                allow: [...AI_CRAWLER_ALLOW],
                disallow: [...AI_CRAWLER_DISALLOW],
            },
        ],
        sitemap: `${MARKETING_SITE_ORIGIN}/sitemap.xml`,
        host: MARKETING_SITE_ORIGIN,
    };
}
