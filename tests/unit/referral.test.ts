import { describe, expect, it } from "vitest";
import {
    buildReferralSignupUrl,
    introTrialDaysForOrganization,
    isValidReferrerUserId,
    REFERRAL_TRIAL_DAYS,
    DEFAULT_TRIAL_DAYS,
} from "../../src/lib/growth/referral";

describe("referral program", () => {
    it("validates referrer UUIDs", () => {
        expect(isValidReferrerUserId("not-a-uuid")).toBe(false);
        expect(isValidReferrerUserId("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
        expect(isValidReferrerUserId(null)).toBe(false);
    });

    it("builds signup URL with ref and UTM params", () => {
        const url = buildReferralSignupUrl("550e8400-e29b-41d4-a716-446655440000");
        const parsed = new URL(url);
        expect(parsed.searchParams.get("ref")).toBe("550e8400-e29b-41d4-a716-446655440000");
        expect(parsed.searchParams.get("utm_source")).toBe("referral");
        expect(parsed.searchParams.get("utm_campaign")).toBe("referral_program");
    });

    it("extends trial for referred organizations", () => {
        expect(introTrialDaysForOrganization(null)).toBe(DEFAULT_TRIAL_DAYS);
        expect(introTrialDaysForOrganization("550e8400-e29b-41d4-a716-446655440000")).toBe(
            REFERRAL_TRIAL_DAYS
        );
    });
});
