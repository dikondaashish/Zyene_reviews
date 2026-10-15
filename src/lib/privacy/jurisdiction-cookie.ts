import { isJurisdiction, jurisdictionForCountry } from "@/lib/privacy/privacy-regions";
import type { Jurisdiction } from "@/lib/privacy/types";

/**
 * The proxy classifies each page request into a jurisdiction and hands the
 * browser only that coarse label (never the country, region, city or IP) in a
 * short-lived, JS-readable cookie. Using a cookie instead of reading headers in
 * the root layout keeps marketing pages static.
 */
export const JURISDICTION_COOKIE_NAME = "zyene_jurisdiction";
export const JURISDICTION_COOKIE_MAX_AGE = 24 * 60 * 60;
/** Vercel sets this on every request at the edge (ISO 3166-1 alpha-2). */
export const VERCEL_COUNTRY_HEADER = "x-vercel-ip-country";
/** Global Privacy Control request header (`Sec-GPC: 1`). */
export const GPC_HEADER = "sec-gpc";
/** Development-only query override, e.g. `?privacy_region=EU_EEA`. */
export const DEV_OVERRIDE_PARAM = "privacy_region";

export type JurisdictionCookie = { jurisdiction: Jurisdiction; gpc: boolean };

export function serializeJurisdictionCookie(value: JurisdictionCookie): string {
    return value.gpc ? `${value.jurisdiction}.gpc` : value.jurisdiction;
}

export function parseJurisdictionCookie(raw: string | null | undefined): JurisdictionCookie | null {
    const [jurisdiction, flag] = (raw ?? "").split(".");
    if (!isJurisdiction(jurisdiction)) return null;
    return { jurisdiction, gpc: flag === "gpc" };
}

/**
 * Decides the cookie value for one request. Precedence:
 *   1. non-production override (query param, then PRIVACY_REGION_OVERRIDE env)
 *   2. Vercel's country header
 *   3. outside production with no header: keep a previous override cookie
 *   4. OTHER (protective fallback)
 * A production deployment ignores every override, so a query string can never
 * relax privacy controls there.
 */
export function resolveJurisdictionCookie(input: {
    country: string | null;
    secGpc: string | null;
    existing: string | null;
    queryOverride: string | null;
    envOverride: string | undefined;
    isProduction: boolean;
}): JurisdictionCookie {
    const gpc = input.secGpc?.trim() === "1";
    if (!input.isProduction) {
        const override = [input.queryOverride, input.envOverride].find(isJurisdiction);
        if (override) return { jurisdiction: override, gpc };
    }
    if (input.country) return { jurisdiction: jurisdictionForCountry(input.country), gpc };
    const previous = parseJurisdictionCookie(input.existing);
    if (!input.isProduction && previous) return { jurisdiction: previous.jurisdiction, gpc };
    return { jurisdiction: "OTHER", gpc };
}

/** Page navigations only: APIs, webhooks, embeds and assets never need it. */
export function wantsJurisdictionCookie(pathname: string): boolean {
    return !(
        pathname.startsWith("/api") ||
        pathname.startsWith("/w/") ||
        pathname.startsWith("/monitoring") ||
        pathname.includes(".")
    );
}
