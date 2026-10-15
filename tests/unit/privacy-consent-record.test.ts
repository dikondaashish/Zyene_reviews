import { describe, expect, it } from "vitest";
import {
    ALLOW_ALL,
    CONSENT_MAX_AGE_DAYS,
    CONSENT_VERSION,
    DENY_ALL,
    buildConsentCookie,
    createConsentRecord,
    legacyConsentToPreferences,
    parseConsent,
    readCookieValue,
    serializeConsent,
    sharedCookieDomain,
} from "@/lib/privacy/consent-record";

const NOW = 1_760_000_000_000;
const DAY = 24 * 60 * 60 * 1000;

describe("consent record (zyene_consent cookie)", () => {
    it("round-trips every category plus region and timestamp", () => {
        const record = createConsentRecord({ functional: true, analytics: false, marketing: true }, "EU_EEA", NOW);
        expect(serializeConsent(record)).toBe(`v${CONSENT_VERSION}.f1.a0.m1.EU_EEA.${NOW}`);
        expect(parseConsent(serializeConsent(record), NOW)).toEqual(record);
    });

    it("restores a stored choice inside its lifetime", () => {
        expect(parseConsent(`v${CONSENT_VERSION}.f0.a1.m0.UK.${NOW - 10 * DAY}`, NOW)).toMatchObject({
            region: "UK",
            analytics: true,
            marketing: false,
        });
    });

    it("re-asks on version mismatch, expiry, tampering or unknown regions", () => {
        expect(parseConsent(null, NOW)).toBeNull();
        expect(parseConsent("accepted", NOW)).toBeNull();
        expect(parseConsent(`v1.a1.m1.${NOW}`, NOW)).toBeNull(); // pre-v2 format
        expect(parseConsent(`v${CONSENT_VERSION + 1}.f1.a1.m1.US.${NOW}`, NOW)).toBeNull();
        expect(parseConsent(`v${CONSENT_VERSION}.f1.a1.m1.MARS.${NOW}`, NOW)).toBeNull();
        expect(parseConsent(`v${CONSENT_VERSION}.f1.a1.m1.US.${NOW - (CONSENT_MAX_AGE_DAYS + 1) * DAY}`, NOW)).toBeNull();
        expect(parseConsent(`v${CONSENT_VERSION}.f1.a1.m1.US.${NOW + 30 * DAY}`, NOW)).toBeNull();
    });

    it("shares the cookie across zyenereviews.com subdomains only", () => {
        for (const host of ["www.zyenereviews.com", "auth.zyenereviews.com", "app.zyenereviews.com", "zyenereviews.com"]) {
            expect(sharedCookieDomain(host)).toBe(".zyenereviews.com");
        }
        expect(sharedCookieDomain("localhost")).toBeUndefined();
        expect(sharedCookieDomain("evilzyenereviews.com")).toBeUndefined();
        expect(sharedCookieDomain("zyene-reviews-git-x.vercel.app")).toBeUndefined();
    });

    it("builds a Secure, Lax, six-month, domain-scoped cookie with no personal data", () => {
        const cookie = buildConsentCookie(createConsentRecord(DENY_ALL, "EU_EEA", NOW), "auth.zyenereviews.com", true);
        expect(cookie).toBe(
            `zyene_consent=v${CONSENT_VERSION}.f0.a0.m0.EU_EEA.${NOW}; path=/; max-age=${CONSENT_MAX_AGE_DAYS * 86400}; SameSite=Lax; domain=.zyenereviews.com; Secure`
        );
        expect(buildConsentCookie(createConsentRecord(DENY_ALL, "OTHER", NOW), "localhost", false)).not.toMatch(/domain=|Secure/);
    });

    it("reads one cookie out of document.cookie and survives bad encoding", () => {
        expect(readCookieValue("a=1; zyene_consent=v2.x; b=2", "zyene_consent")).toBe("v2.x");
        expect(readCookieValue("a=1", "zyene_consent")).toBeNull();
        expect(readCookieValue("zyene_consent=%E0%A4%A", "zyene_consent")).toBeNull();
    });

    it("migrates the old localStorage banner choice without inventing functional consent", () => {
        expect(legacyConsentToPreferences("accepted", null)).toEqual(ALLOW_ALL);
        expect(legacyConsentToPreferences("declined", null)).toEqual(DENY_ALL);
        expect(legacyConsentToPreferences("custom", '{"analytics":true,"marketing":false}')).toEqual({
            functional: false,
            analytics: true,
            marketing: false,
        });
        expect(legacyConsentToPreferences("custom", "{bad")).toBeNull();
        expect(legacyConsentToPreferences(null, null)).toBeNull();
    });
});
