import { describe, expect, it } from "vitest";
import { googleConsentModeState, isWithdrawal, resolvePrivacyState } from "@/lib/privacy/consent-policy";
import { ALLOW_ALL, DENY_ALL, createConsentRecord } from "@/lib/privacy/consent-record";
import { jurisdictionForCountry } from "@/lib/privacy/privacy-regions";
import type { ConsentPreferences, Jurisdiction } from "@/lib/privacy/types";

const NOW = 1_760_000_000_000;
const record = (prefs: ConsentPreferences, region: Jurisdiction = "EU_EEA") => createConsentRecord(prefs, region, NOW);
const ONLY_ANALYTICS = { functional: false, analytics: true, marketing: false };

describe("jurisdiction classification", () => {
    it("maps countries onto the four groups with a protective fallback", () => {
        expect(jurisdictionForCountry("DE")).toBe("EU_EEA");
        expect(jurisdictionForCountry("no")).toBe("EU_EEA"); // EEA, case-insensitive
        expect(jurisdictionForCountry("GB")).toBe("UK");
        expect(jurisdictionForCountry("US")).toBe("US");
        expect(jurisdictionForCountry("PR")).toBe("US");
        expect(jurisdictionForCountry("IN")).toBe("OTHER");
        expect(jurisdictionForCountry(null)).toBe("OTHER");
        expect(jurisdictionForCountry("")).toBe("OTHER");
    });
});

describe("resolvePrivacyState", () => {
    it("EU visitor with no consent: banner, nothing optional granted", () => {
        const s = resolvePrivacyState({ record: null, jurisdiction: "EU_EEA", gpc: false });
        expect(s).toMatchObject({ decided: false, showBanner: true, granted: DENY_ALL });
    });

    it("EU visitor accepts all / rejects / enables only analytics", () => {
        expect(resolvePrivacyState({ record: record(ALLOW_ALL), jurisdiction: "EU_EEA", gpc: false })).toMatchObject({
            decided: true,
            showBanner: false,
            granted: ALLOW_ALL,
        });
        expect(resolvePrivacyState({ record: record(DENY_ALL), jurisdiction: "EU_EEA", gpc: false }).granted).toEqual(DENY_ALL);
        expect(resolvePrivacyState({ record: record(ONLY_ANALYTICS), jurisdiction: "EU_EEA", gpc: false }).granted).toEqual(
            ONLY_ANALYTICS
        );
    });

    it("UK and unknown regions behave like the EU (opt-in)", () => {
        for (const jurisdiction of ["UK", "OTHER"] as const) {
            expect(resolvePrivacyState({ record: null, jurisdiction, gpc: false })).toMatchObject({
                showBanner: true,
                granted: DENY_ALL,
            });
        }
    });

    it("US visitor: no banner, opt-out defaults, GPC switches marketing off only", () => {
        expect(resolvePrivacyState({ record: null, jurisdiction: "US", gpc: false })).toMatchObject({
            decided: false,
            showBanner: false,
            granted: ALLOW_ALL,
        });
        expect(resolvePrivacyState({ record: null, jurisdiction: "US", gpc: true }).granted).toEqual({
            functional: true,
            analytics: true,
            marketing: false,
        });
    });

    it("GPC vetoes marketing even after Accept all, and never touches other categories", () => {
        const s = resolvePrivacyState({ record: record(ALLOW_ALL), jurisdiction: "EU_EEA", gpc: true });
        expect(s.granted).toEqual({ functional: true, analytics: true, marketing: false });
        expect(s.gpc).toBe(true);
    });

    it("a stored choice wins over the current jurisdiction's defaults", () => {
        expect(resolvePrivacyState({ record: record(DENY_ALL, "EU_EEA"), jurisdiction: "US", gpc: false }).granted).toEqual(
            DENY_ALL
        );
    });
});

describe("changing consent later", () => {
    it("flags withdrawals (scripts must be unloaded) but not grants", () => {
        expect(isWithdrawal(DENY_ALL, ALLOW_ALL)).toBe(false);
        expect(isWithdrawal(ALLOW_ALL, ONLY_ANALYTICS)).toBe(true);
        expect(isWithdrawal(ALLOW_ALL, { ...ALLOW_ALL, functional: false })).toBe(true);
        // A US visitor opting out of defaults is a withdrawal too.
        const us = resolvePrivacyState({ record: null, jurisdiction: "US", gpc: false });
        expect(isWithdrawal(us.granted, { ...ALLOW_ALL, marketing: false })).toBe(true);
    });
});

describe("Google Consent Mode v2", () => {
    it("mirrors each category and keeps security storage granted", () => {
        expect(googleConsentModeState(ONLY_ANALYTICS)).toEqual({
            analytics_storage: "granted",
            ad_storage: "denied",
            ad_user_data: "denied",
            ad_personalization: "denied",
            functionality_storage: "denied",
            personalization_storage: "denied",
            security_storage: "granted",
        });
    });
});
