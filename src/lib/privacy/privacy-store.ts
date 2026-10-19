"use client";

import { useSyncExternalStore } from "react";
import { UTM_COOKIE_NAME } from "@/lib/growth/utm";
import { isWithdrawal, resolvePrivacyState } from "@/lib/privacy/consent-policy";
import {
    CONSENT_COOKIE_NAME,
    LEGACY_CONSENT_KEY,
    LEGACY_PREFERENCES_KEY,
    buildConsentCookie,
    createConsentRecord,
    legacyConsentToPreferences,
    parseConsent,
    readCookieValue,
    sharedCookieDomain,
} from "@/lib/privacy/consent-record";
import { JURISDICTION_COOKIE_NAME, parseJurisdictionCookie } from "@/lib/privacy/jurisdiction-cookie";
import type { ConsentPreferences, ConsentRecord, Jurisdiction, OptionalCategory, PrivacyState } from "@/lib/privacy/types";

/**
 * PrivacyManager (browser side). The only module that reads or writes consent
 * storage; components use `usePrivacy()`, plain functions use `hasConsent()`.
 */

const CHANGE_EVENT = "zyene:privacy-change";
export const OPEN_SETTINGS_EVENT = "zyene:open-privacy-settings";

/** Cookies the gated tools set; expired when their category is withdrawn. */
const COOKIES_BY_CATEGORY: Record<OptionalCategory, string[]> = {
    functional: [],
    analytics: ["_ga", "_gid", "_gat"],
    marketing: ["_fbp", "_fbc", "_gcl", UTM_COOKIE_NAME],
};

function cookieString(): string {
    try {
        return document.cookie;
    } catch {
        return "";
    }
}

function readJurisdiction(): { jurisdiction: Jurisdiction; gpcHeader: boolean } {
    const parsed = parseJurisdictionCookie(readCookieValue(cookieString(), JURISDICTION_COOKIE_NAME));
    // Missing cookie (proxy skipped, cookies blocked): protective fallback.
    return { jurisdiction: parsed?.jurisdiction ?? "OTHER", gpcHeader: parsed?.gpc ?? false };
}

export function browserSendsGpc(): boolean {
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    return nav.globalPrivacyControl === true || readJurisdiction().gpcHeader;
}

/** Pass the browser-only GPC signal to same-origin APIs that create subscriptions. */
export function privacyRequestHeaders(): Record<string, string> {
    return browserSendsGpc() ? { "x-zyene-gpc": "1" } : {};
}

function writeRecord(record: ConsentRecord): void {
    document.cookie = buildConsentCookie(record, window.location.hostname, window.location.protocol === "https:");
}

/** Moves a pre-cookie localStorage choice into the shared cookie once. */
function migrateLegacyConsent(jurisdiction: Jurisdiction): ConsentRecord | null {
    try {
        const prefs = legacyConsentToPreferences(
            localStorage.getItem(LEGACY_CONSENT_KEY),
            localStorage.getItem(LEGACY_PREFERENCES_KEY)
        );
        if (!prefs) return null;
        localStorage.removeItem(LEGACY_CONSENT_KEY);
        localStorage.removeItem(LEGACY_PREFERENCES_KEY);
        const record = createConsentRecord(prefs, jurisdiction);
        writeRecord(record);
        return record;
    } catch {
        return null;
    }
}

export function getPrivacyState(): PrivacyState {
    const { jurisdiction } = readJurisdiction();
    const record = parseConsent(readCookieValue(cookieString(), CONSENT_COOKIE_NAME)) ?? migrateLegacyConsent(jurisdiction);
    return resolvePrivacyState({ record, jurisdiction, gpc: browserSendsGpc() });
}

function expireCookies(prefixes: string[]): void {
    const domain = sharedCookieDomain(window.location.hostname);
    for (const name of cookieString().split(/;\s*/).map((c) => c.split("=")[0])) {
        if (!prefixes.some((p) => name.startsWith(p))) continue;
        document.cookie = `${name}=; path=/; max-age=0`;
        if (domain) document.cookie = `${name}=; path=/; max-age=0; domain=${domain}`;
    }
}

/** Persists an explicit choice for every subdomain and unloads anything withdrawn. */
export function savePrivacyChoice(prefs: ConsentPreferences): void {
    const before = getPrivacyState();
    writeRecord(createConsentRecord(prefs, before.jurisdiction));
    for (const category of Object.keys(COOKIES_BY_CATEGORY) as OptionalCategory[]) {
        if (!prefs[category]) expireCookies(COOKIES_BY_CATEGORY[category]);
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
    const after = getPrivacyState();
    if (before.granted.marketing !== after.granted.marketing) {
        void fetch("/api/privacy/meta-consent", {
            method: "POST",
            credentials: "same-origin",
            headers: privacyRequestHeaders(),
            keepalive: true,
        }).catch(() => {
            // The local choice takes effect immediately; server sync is best effort.
        });
    }
    // Third-party scripts cannot be unloaded in place; a reload is the only reliable stop.
    if (isWithdrawal(before.granted, after.granted)) window.location.reload();
}

export function openPrivacySettings(): void {
    window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

function subscribe(onChange: () => void): () => void {
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener("focus", onChange); // a choice made on another subdomain/tab
    return () => {
        window.removeEventListener(CHANGE_EVENT, onChange);
        window.removeEventListener("focus", onChange);
    };
}

/** Stable primitive snapshot so React re-renders only when the state changes. */
function getSnapshot(): string {
    return JSON.stringify(getPrivacyState());
}

const SERVER_STATE: PrivacyState = resolvePrivacyState({ record: null, jurisdiction: "OTHER", gpc: false });
const SERVER_SNAPSHOT = JSON.stringify({ ...SERVER_STATE, showBanner: false });

/**
 * Server render and hydration use the protective "nothing granted, no banner"
 * state, so no tracker can render in HTML and the banner never mismatches.
 */
export function usePrivacy(): PrivacyState {
    return JSON.parse(useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SNAPSHOT)) as PrivacyState;
}

/** Non-hook check for plain functions (event trackers, cookie writers). */
export function hasConsent(category: OptionalCategory): boolean {
    try {
        return getPrivacyState().granted[category];
    } catch {
        return false;
    }
}

/** True only when the visitor explicitly turned analytics off (used by cookieless measurement). */
export function analyticsExplicitlyRejected(): boolean {
    try {
        const state = getPrivacyState();
        return state.decided && !state.granted.analytics;
    } catch {
        return false;
    }
}
