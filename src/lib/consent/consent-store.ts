"use client";

import { useSyncExternalStore } from "react";
import {
    CONSENT_COOKIE_NAME,
    LEGACY_CONSENT_KEY,
    LEGACY_PREFERENCES_KEY,
    buildConsentCookie,
    consentCookieDomain,
    createConsentRecord,
    effectivePreferences,
    isWithdrawal,
    legacyConsentToPreferences,
    parseConsent,
    readCookieValue,
    type ConsentPreferences,
    type ConsentRecord,
} from "@/lib/consent/consent-record";
import { UTM_COOKIE_NAME } from "@/lib/growth/utm";

const CHANGE_EVENT = "zyene:consent-change";
export const OPEN_PREFERENCES_EVENT = "zyene:open-cookie-preferences";

/** Cookies set by the gated tools; removed when the visitor withdraws consent. */
const ANALYTICS_COOKIE_PREFIXES = ["_ga", "_gid", "_gat"];
const MARKETING_COOKIE_PREFIXES = ["_fbp", "_fbc", "_gcl", UTM_COOKIE_NAME];

function readRawConsent(): string | null {
    try {
        return readCookieValue(document.cookie, CONSENT_COOKIE_NAME);
    } catch {
        return null;
    }
}

function writeRecord(record: ConsentRecord): void {
    document.cookie = buildConsentCookie(record, window.location.hostname, window.location.protocol === "https:");
}

/** Moves a pre-cookie localStorage choice into the shared cookie once. */
function migrateLegacyConsent(): ConsentRecord | null {
    try {
        const prefs = legacyConsentToPreferences(
            localStorage.getItem(LEGACY_CONSENT_KEY),
            localStorage.getItem(LEGACY_PREFERENCES_KEY)
        );
        localStorage.removeItem(LEGACY_CONSENT_KEY);
        localStorage.removeItem(LEGACY_PREFERENCES_KEY);
        if (!prefs) return null;
        const record = createConsentRecord(prefs);
        writeRecord(record);
        return record;
    } catch {
        return null;
    }
}

export function readStoredConsent(): ConsentRecord | null {
    return parseConsent(readRawConsent()) ?? migrateLegacyConsent();
}

export function hasGlobalPrivacyControl(): boolean {
    return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

function expireCookies(prefixes: string[]): void {
    const domain = consentCookieDomain(window.location.hostname);
    const names = document.cookie.split(/;\s*/).map((c) => c.split("=")[0]);
    for (const name of names) {
        if (!prefixes.some((p) => name.startsWith(p))) continue;
        document.cookie = `${name}=; path=/; max-age=0`;
        if (domain) document.cookie = `${name}=; path=/; max-age=0; domain=${domain}`;
    }
}

/** Persists the choice for every subdomain, notifies listeners, and unloads withdrawn tools. */
export function saveConsent(prefs: ConsentPreferences): void {
    const previous = parseConsent(readRawConsent());
    writeRecord(createConsentRecord(prefs));
    if (!prefs.analytics) expireCookies(ANALYTICS_COOKIE_PREFIXES);
    if (!prefs.marketing) expireCookies(MARKETING_COOKIE_PREFIXES);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    // Third-party scripts cannot be unloaded in place; a reload is the only reliable stop.
    if (isWithdrawal(previous, prefs)) window.location.reload();
}

export function openCookiePreferences(): void {
    window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT));
}

function subscribe(onChange: () => void): () => void {
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener("focus", onChange); // pick up a choice made on another subdomain/tab
    return () => {
        window.removeEventListener(CHANGE_EVENT, onChange);
        window.removeEventListener("focus", onChange);
    };
}

/** Snapshot is the raw cookie string so React gets a stable primitive between renders. */
function getSnapshot(): string {
    const record = readStoredConsent();
    return record ? `${record.analytics ? 1 : 0}${record.marketing ? 1 : 0}${hasGlobalPrivacyControl() ? 1 : 0}` : "";
}

/** `decided` is false until the visitor chooses; `granted` already accounts for GPC. */
export function useConsent(): { decided: boolean; granted: ConsentPreferences; gpc: boolean } {
    const snap = useSyncExternalStore(subscribe, getSnapshot, () => "");
    if (!snap) return { decided: false, granted: effectivePreferences(null, false), gpc: false };
    const gpc = snap[2] === "1";
    return {
        decided: true,
        granted: effectivePreferences({ analytics: snap[0] === "1", marketing: snap[1] === "1" }, gpc),
        gpc,
    };
}

/** Non-hook check for plain functions (event trackers, cookie writers). */
export function hasConsent(category: keyof ConsentPreferences): boolean {
    try {
        return effectivePreferences(readStoredConsent(), hasGlobalPrivacyControl())[category];
    } catch {
        return false;
    }
}
