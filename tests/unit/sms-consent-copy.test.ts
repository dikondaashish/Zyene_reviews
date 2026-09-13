import { describe, expect, it } from "vitest";

import { SMS_CONSENT_COPY } from "@/lib/twilio/sms-consent-copy";

describe("SMS consent copy", () => {
    it("documents the consent safeguards Twilio reviewers need to see", () => {
        expect(SMS_CONSENT_COPY.policy).toContain("express written consent");
        expect(SMS_CONSENT_COPY.checkboxLabel).toContain("not a condition of purchase");
        expect(SMS_CONSENT_COPY.checkboxLabel).toContain("Reply STOP");
        expect(SMS_CONSENT_COPY.checkboxLabel).toContain("Reply HELP");
        expect(SMS_CONSENT_COPY.checkboxLabel).toContain("Message and data rates may apply");
        expect(SMS_CONSENT_COPY.privacyHref).toBe("/privacy");
        expect(SMS_CONSENT_COPY.termsHref).toBe("/terms");
    });
});
