/**
 * Cookie-consent record: pure parsing/serialising so it can be unit-tested and
 * shared by the banner, the script gate and the UTM capture.
 *
 * The record lives in a first-party cookie scoped to the registrable domain
 * (`.zyenereviews.com`), so one choice covers www, auth and app. Strictly
 * necessary storage (Supabase session, CSRF/OAuth state, locale, theme and this
 * record itself) never waits for it.
 */

export type ConsentPreferences = { analytics: boolean; marketing: boolean };
export type ConsentRecord = ConsentPreferences & { version: number; decidedAt: number };

export const CONSENT_COOKIE_NAME = "zyene_consent";
/** Bump when categories or tools change materially so everyone is asked again. */
export const CONSENT_VERSION = 1;
/** Re-ask after six months (CNIL guidance; within ICO/EDPB expectations). */
export const CONSENT_MAX_AGE_DAYS = 180;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Shared parent domains: a choice made on any subdomain applies to all of them. */
const SHARED_CONSENT_DOMAINS = ["zyenereviews.com"];

/** Pre-2026-10 banner stored per-origin in localStorage under these keys. */
export const LEGACY_CONSENT_KEY = "cookie-consent";
export const LEGACY_PREFERENCES_KEY = "cookie-preferences";

export const DENY_ALL: ConsentPreferences = { analytics: false, marketing: false };
export const ALLOW_ALL: ConsentPreferences = { analytics: true, marketing: true };

export function serializeConsent(record: ConsentRecord): string {
    return `v${record.version}.a${record.analytics ? 1 : 0}.m${record.marketing ? 1 : 0}.${record.decidedAt}`;
}

/** Returns null for missing, malformed, outdated-version or expired records. */
export function parseConsent(raw: string | null | undefined, now = Date.now()): ConsentRecord | null {
    const match = /^v(\d+)\.a([01])\.m([01])\.(\d+)$/.exec(raw?.trim() ?? "");
    if (!match) return null;
    const version = Number(match[1]);
    const decidedAt = Number(match[4]);
    if (version !== CONSENT_VERSION) return null;
    if (decidedAt > now + DAY_MS || now - decidedAt > CONSENT_MAX_AGE_DAYS * DAY_MS) return null;
    return { version, decidedAt, analytics: match[2] === "1", marketing: match[3] === "1" };
}

export function createConsentRecord(prefs: ConsentPreferences, now = Date.now()): ConsentRecord {
    return { version: CONSENT_VERSION, decidedAt: now, analytics: prefs.analytics, marketing: prefs.marketing };
}

/** `.zyenereviews.com` on production hosts; host-only (undefined) on localhost, previews and review domains. */
export function consentCookieDomain(hostname: string): string | undefined {
    const host = hostname.toLowerCase();
    const parent = SHARED_CONSENT_DOMAINS.find((d) => host === d || host.endsWith(`.${d}`));
    return parent ? `.${parent}` : undefined;
}

export function buildConsentCookie(record: ConsentRecord, hostname: string, secure: boolean): string {
    const domain = consentCookieDomain(hostname);
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
    return row ? decodeURIComponent(row.slice(name.length + 1)) : null;
}

/** Converts a stored choice from the old localStorage banner, so returning visitors are not re-asked. */
export function legacyConsentToPreferences(
    consent: string | null,
    preferencesRaw: string | null
): ConsentPreferences | null {
    if (consent === "accepted") return ALLOW_ALL;
    if (consent === "declined") return DENY_ALL;
    if (consent !== "custom" || !preferencesRaw) return null;
    try {
        const parsed = JSON.parse(preferencesRaw) as Partial<ConsentPreferences>;
        return { analytics: parsed.analytics === true, marketing: parsed.marketing === true };
    } catch {
        return null;
    }
}

/**
 * Global Privacy Control is a legally binding opt-out of "sale/sharing" under
 * CCPA/CPRA (and honoured as an objection elsewhere), so it always switches
 * marketing off regardless of the stored record.
 */
export function effectivePreferences(record: ConsentPreferences | null, gpc: boolean): ConsentPreferences {
    if (!record) return DENY_ALL;
    return { analytics: record.analytics, marketing: record.marketing && !gpc };
}

/** Google Consent Mode v2 state matching the visitor's choice. */
export function googleConsentModeState(prefs: ConsentPreferences) {
    const ads = prefs.marketing ? "granted" : "denied";
    return {
        analytics_storage: prefs.analytics ? "granted" : "denied",
        ad_storage: ads,
        ad_user_data: ads,
        ad_personalization: ads,
    } as const;
}

/** True when a change removes a previously granted category (scripts must be unloaded). */
export function isWithdrawal(previous: ConsentPreferences | null, next: ConsentPreferences): boolean {
    if (!previous) return false;
    return (previous.analytics && !next.analytics) || (previous.marketing && !next.marketing);
}
