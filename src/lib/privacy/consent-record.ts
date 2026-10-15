import { isJurisdiction } from "@/lib/privacy/privacy-regions";
import type { ConsentPreferences, ConsentRecord, Jurisdiction } from "@/lib/privacy/types";

/**
 * The persisted consent record: a first-party cookie scoped to the registrable
 * domain so one choice covers www, auth and app. Pure functions only, so the
 * proxy, the client store and tests share one implementation. Treat the value
 * as untrusted input: it gates trackers, never authorization.
 */

export const CONSENT_COOKIE_NAME = "zyene_consent";
/**
 * Bump when categories or the tools inside them change materially; older
 * records then parse as null and the visitor is asked again.
 * v1 (2026-10-15, analytics/marketing only) -> v2 adds functional + region.
 */
export const CONSENT_VERSION = 2;
/** Re-ask after six months (CNIL guidance; within ICO/EDPB expectations). */
export const CONSENT_MAX_AGE_DAYS = 180;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Shared parent domains: a choice made on any subdomain applies to all of them. */
const SHARED_COOKIE_DOMAINS = ["zyenereviews.com"];

/** Pre-cookie banner stored per-origin in localStorage under these keys. */
export const LEGACY_CONSENT_KEY = "cookie-consent";
export const LEGACY_PREFERENCES_KEY = "cookie-preferences";

export const DENY_ALL: ConsentPreferences = { functional: false, analytics: false, marketing: false };
export const ALLOW_ALL: ConsentPreferences = { functional: true, analytics: true, marketing: true };

const bit = (value: boolean) => (value ? 1 : 0);

export function serializeConsent(record: ConsentRecord): string {
    return [
        `v${record.version}`,
        `f${bit(record.functional)}`,
        `a${bit(record.analytics)}`,
        `m${bit(record.marketing)}`,
        record.region,
        record.decidedAt,
    ].join(".");
}

/** Returns null for missing, malformed, other-version or expired records. */
export function parseConsent(raw: string | null | undefined, now = Date.now()): ConsentRecord | null {
    const match = /^v(\d+)\.f([01])\.a([01])\.m([01])\.([A-Z_]+)\.(\d+)$/.exec(raw?.trim() ?? "");
    if (!match) return null;
    const [, version, functional, analytics, marketing, region, decidedAt] = match;
    if (Number(version) !== CONSENT_VERSION || !isJurisdiction(region)) return null;
    const at = Number(decidedAt);
    if (at > now + DAY_MS || now - at > CONSENT_MAX_AGE_DAYS * DAY_MS) return null;
    return {
        version: CONSENT_VERSION,
        region,
        decidedAt: at,
        functional: functional === "1",
        analytics: analytics === "1",
        marketing: marketing === "1",
    };
}

export function createConsentRecord(prefs: ConsentPreferences, region: Jurisdiction, now = Date.now()): ConsentRecord {
    return {
        version: CONSENT_VERSION,
        region,
        decidedAt: now,
        functional: prefs.functional,
        analytics: prefs.analytics,
        marketing: prefs.marketing,
    };
}

/** `.zyenereviews.com` on production hosts; host-only (undefined) on localhost, previews and review domains. */
export function sharedCookieDomain(hostname: string): string | undefined {
    const host = hostname.toLowerCase();
    const parent = SHARED_COOKIE_DOMAINS.find((d) => host === d || host.endsWith(`.${d}`));
    return parent ? `.${parent}` : undefined;
}

export function buildConsentCookie(record: ConsentRecord, hostname: string, secure: boolean): string {
    const domain = sharedCookieDomain(hostname);
    return [
        `${CONSENT_COOKIE_NAME}=${serializeConsent(record)}`,
        "path=/",
        `max-age=${CONSENT_MAX_AGE_DAYS * 24 * 60 * 60}`,
        "SameSite=Lax",
        domain ? `domain=${domain}` : "",
        secure ? "Secure" : "",
    ]
        .filter(Boolean)
        .join("; ");
}

export function readCookieValue(cookieHeader: string, name: string): string | null {
    const row = cookieHeader.split(/;\s*/).find((part) => part.startsWith(`${name}=`));
    if (!row) return null;
    try {
        return decodeURIComponent(row.slice(name.length + 1));
    } catch {
        return null;
    }
}

/** Converts a choice from the old localStorage banner so returning visitors are not re-asked. */
export function legacyConsentToPreferences(
    consent: string | null,
    preferencesRaw: string | null
): ConsentPreferences | null {
    if (consent === "accepted") return ALLOW_ALL;
    if (consent === "declined") return DENY_ALL;
    if (consent !== "custom" || !preferencesRaw) return null;
    try {
        const parsed = JSON.parse(preferencesRaw) as Partial<ConsentPreferences>;
        // The old banner had no functional category; leave it off rather than assume.
        return { functional: false, analytics: parsed.analytics === true, marketing: parsed.marketing === true };
    } catch {
        return null;
    }
}
