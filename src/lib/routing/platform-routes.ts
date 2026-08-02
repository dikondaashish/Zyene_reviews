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

export const AUTH_PAGE_PATHS = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
] as const;

export function isAuthPageRoute(pathname: string): boolean {
    return AUTH_PAGE_PATHS.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
    );
}

export function getAuthSiteOrigin(rootDomain: string): string {
    const root = rootDomain
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");
    const isLocal = root.includes("localhost") || root.includes("127.0.0.1");
    if (isLocal) return `http://${root}`;

    const host = root.replace(/^(?:www\.|app\.|auth\.)/, "");
    return `https://auth.${host}`;
}

export function getAuthSiteUrl(rootDomain: string, pathname: `/${string}`): string {
    const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return `${getAuthSiteOrigin(rootDomain)}${normalizedPath}`;
}

export function getAppSiteOrigin(
    rootDomain: string,
    configuredAppUrl?: string | null
): string {
    const root = rootDomain
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");
    const isLocal = root.includes("localhost") || root.includes("127.0.0.1");

    if (configuredAppUrl) {
        try {
            const configured = new URL(configuredAppUrl);
            if (isLocal) return configured.origin;

            const apexHost = root.replace(/^(?:www\.|app\.|auth\.)/, "").split(":")[0];
            const marketingOrAuthHosts = new Set([
                apexHost,
                `www.${apexHost}`,
                `auth.${apexHost}`,
            ]);
            if (!marketingOrAuthHosts.has(configured.hostname)) {
                return configured.origin;
            }
        } catch {
            // Fall through to the root-domain-derived app origin.
        }
    }

    if (isLocal) return `http://${root}`;
    const apexHost = root.replace(/^(?:www\.|app\.|auth\.)/, "").split(":")[0];
    return `https://app.${apexHost}`;
}

/** Auth, app, and infrastructure paths — never business slugs on any host. */
export const PLATFORM_ROUTE_PREFIXES = [
    "/api",
    "/_next",
    "/static",
    "/favicon.ico",
    "/favicon_io",
    ...AUTH_PAGE_PATHS,
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

/** Legacy blueprint alias `/customers` → `/case-studies` (marketing host only). */
export function customersToCaseStudiesRedirect(pathname: string): string | null {
    if (pathname === "/customers") {
        return "/case-studies";
    }
    if (pathname.startsWith("/customers/")) {
        const slug = pathname.slice("/customers/".length).split("/")[0];
        if (slug) {
            return `/case-studies/${slug}`;
        }
    }
    return null;
}
