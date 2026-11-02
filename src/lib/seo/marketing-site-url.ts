import { NEXT_PUBLIC_ROOT_DOMAIN } from "@/config/env";

/** Apex host without port or scheme (e.g. `zyenereviews.com`). */
function apexHost(): string {
    return NEXT_PUBLIC_ROOT_DOMAIN.replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split(":")[0] ?? NEXT_PUBLIC_ROOT_DOMAIN;
}

/**
 * Canonical public marketing origin.
 * Production uses `https://www.zyenereviews.com`; localhost keeps the dev host.
 */
export function getMarketingSiteOrigin(): string {
    const root = NEXT_PUBLIC_ROOT_DOMAIN;
    const protocol = root.includes("localhost") ? "http" : "https";
    if (root.includes("localhost")) {
        return `${protocol}://${root}`;
    }
    return `${protocol}://www.${apexHost()}`;
}

export const MARKETING_SITE_ORIGIN = getMarketingSiteOrigin();

/** Build absolute canonical URL for a marketing path (leading slash required). */
export function marketingCanonicalUrl(path: string): string {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${MARKETING_SITE_ORIGIN}${normalized}`;
}
