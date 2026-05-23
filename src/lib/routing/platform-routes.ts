/**
 * Routes that belong on the marketing site (zyenereviews.com), not on review-capture
 * domains (collectratings.com / ratingcollect.com) and not treated as business slugs.
 */

/** Path prefixes served only on the marketing apex (www.zyenereviews.com). */
export const MARKETING_ROUTE_PREFIXES = [
    "/pricing",
    "/features",
    "/customers",
    "/how-it-works",
    "/integrations",
    "/industries",
    "/compare",
    "/blog",
    "/resources",
    "/help",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/data-retention",
    "/security",
    "/case-studies",
    "/partners",
    "/agencies",
    "/demo",
    "/enterprise",
    "/es",
    "/newsletter",
    "/tools",
    "/docs",
    "/growth",
] as const;

/** Auth, app, and infrastructure paths — never business slugs on any host. */
export const PLATFORM_ROUTE_PREFIXES = [
    "/api",
    "/_next",
    "/static",
    "/favicon.ico",
    "/favicon_io",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/onboarding",
    "/dashboard",
    "/settings",
    "/businesses",
    "/reviews",
    "/campaigns",
    "/analytics",
    "/competitors",
    "/customers",
    "/review-requests",
    "/requests",
    "/questions",
    "/google-seo-aeo",
    "/r/",
    "/w/",
    ...MARKETING_ROUTE_PREFIXES,
] as const;

export function isPlatformRoute(pathname: string): boolean {
    if (pathname === "/") return true;
    return PLATFORM_ROUTE_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(prefix)
    );
}

/** True when the path is a single-segment slug (e.g. /acme-dental), not a platform route. */
export function isBusinessSlugPath(pathname: string): boolean {
    const normalized = pathname.endsWith("/") && pathname.length > 1
        ? pathname.slice(0, -1)
        : pathname;
    if (!/^\/[^/]+$/.test(normalized)) return false;
    return !isPlatformRoute(normalized);
}

export function getMarketingSiteOrigin(rootDomain: string): string {
    const protocol = rootDomain.includes("localhost") ? "http" : "https";
    if (rootDomain.includes("localhost")) {
        return `${protocol}://${rootDomain}`;
    }
    const host = rootDomain.split(":")[0]?.replace(/^www\./, "") ?? rootDomain;
    return `${protocol}://www.${host}`;
}
