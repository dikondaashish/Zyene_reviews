import { describe, expect, it } from "vitest";
import {
    ALLOW_ALL,
    CONSENT_MAX_AGE_DAYS,
    CONSENT_VERSION,
    DENY_ALL,
    buildConsentCookie,
    consentCookieDomain,
    createConsentRecord,
    effectivePreferences,
    googleConsentModeState,
    isWithdrawal,
    legacyConsentToPreferences,
    parseConsent,
    readCookieValue,
    serializeConsent,
} from "@/lib/consent/consent-record";

const NOW = 1_760_000_000_000;
const DAY = 24 * 60 * 60 * 1000;

describe("consent record", () => {
    it("round-trips a choice through the cookie value", () => {
        const record = createConsentRecord({ analytics: true, marketing: false }, NOW);
        expect(parseConsent(serializeConsent(record), NOW)).toEqual(record);
    });

    it("rejects malformed, other-version and expired records so the banner asks again", () => {
        expect(parseConsent(null, NOW)).toBeNull();
        expect(parseConsent("accepted", NOW)).toBeNull();
        expect(parseConsent(`v${CONSENT_VERSION + 1}.a1.m1.${NOW}`, NOW)).toBeNull();
        expect(parseConsent(`v${CONSENT_VERSION}.a1.m1.${NOW - (CONSENT_MAX_AGE_DAYS + 1) * DAY}`, NOW)).toBeNull();
        expect(parseConsent(`v${CONSENT_VERSION}.a1.m1.${NOW - 10 * DAY}`, NOW)).not.toBeNull();
    });

    it("shares the cookie across every zyenereviews.com subdomain only", () => {
        expect(consentCookieDomain("www.zyenereviews.com")).toBe(".zyenereviews.com");
        expect(consentCookieDomain("auth.zyenereviews.com")).toBe(".zyenereviews.com");
        expect(consentCookieDomain("app.zyenereviews.com")).toBe(".zyenereviews.com");
        expect(consentCookieDomain("zyenereviews.com")).toBe(".zyenereviews.com");
        expect(consentCookieDomain("localhost")).toBeUndefined();
        expect(consentCookieDomain("evilzyenereviews.com")).toBeUndefined();
        expect(consentCookieDomain("zyene-reviews-git-x.vercel.app")).toBeUndefined();
    });

    it("builds a long-lived, domain-scoped, Lax cookie", () => {
        const cookie = buildConsentCookie(createConsentRecord(DENY_ALL, NOW), "auth.zyenereviews.com", true);
        expect(cookie).toContain(`zyene_consent=v${CONSENT_VERSION}.a0.m0.${NOW}`);
        expect(cookie).toContain("domain=.zyenereviews.com");
        expect(cookie).toContain(`max-age=${CONSENT_MAX_AGE_DAYS * 86400}`);
        expect(cookie).toContain("SameSite=Lax");
        expect(cookie).toContain("Secure");
        expect(buildConsentCookie(createConsentRecord(DENY_ALL, NOW), "localhost", false)).not.toMatch(/domain=|Secure/);
    });

    it("reads one cookie out of a document.cookie string", () => {
        expect(readCookieValue("a=1; zyene_consent=v1.a1.m0.5; b=2", "zyene_consent")).toBe("v1.a1.m0.5");
        expect(readCookieValue("a=1", "zyene_consent")).toBeNull();
    });

    it("migrates the old localStorage banner choice", () => {
        expect(legacyConsentToPreferences("accepted", null)).toEqual(ALLOW_ALL);
        expect(legacyConsentToPreferences("declined", null)).toEqual(DENY_ALL);
        expect(legacyConsentToPreferences("custom", '{"analytics":true,"marketing":false}')).toEqual({
            analytics: true,
            marketing: false,
        });
        expect(legacyConsentToPreferences("custom", "{bad")).toBeNull();
        expect(legacyConsentToPreferences(null, null)).toBeNull();
    });

    it("denies everything before a choice and lets GPC veto marketing", () => {
        expect(effectivePreferences(null, false)).toEqual(DENY_ALL);
        expect(effectivePreferences(ALLOW_ALL, true)).toEqual({ analytics: true, marketing: false });
        expect(effectivePreferences(ALLOW_ALL, false)).toEqual(ALLOW_ALL);
    });

    it("maps choices onto Google Consent Mode v2", () => {
        expect(googleConsentModeState({ analytics: true, marketing: false })).toEqual({
            analytics_storage: "granted",
            ad_storage: "denied",
            ad_user_data: "denied",
            ad_personalization: "denied",
        });
    });

    it("flags withdrawals (which need a reload) but not first choices or upgrades", () => {
        expect(isWithdrawal(null, DENY_ALL)).toBe(false);
        expect(isWithdrawal(DENY_ALL, ALLOW_ALL)).toBe(false);
        expect(isWithdrawal(ALLOW_ALL, { analytics: true, marketing: false })).toBe(true);
    });
});
