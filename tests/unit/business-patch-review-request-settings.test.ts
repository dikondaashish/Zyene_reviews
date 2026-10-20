import { describe, expect, it } from "vitest";
import { businessPatchSchema } from "@/services/businesses/business-patch-schema";

// Shape sent by components/settings/use-review-settings-form.ts
const settingsPayload = {
    review_request_delay_minutes: 120,
    review_request_min_amount_cents: 1500,
    review_request_frequency_cap_days: 30,
    review_request_sms_enabled: true,
    review_request_email_enabled: false,
};

describe("business PATCH schema: review request settings", () => {
    it("accepts the review settings form payload", () => {
        expect(businessPatchSchema.safeParse(settingsPayload).success).toBe(true);
    });

    it.each([
        ["negative delay", { review_request_delay_minutes: -1 }],
        ["delay over 7 days", { review_request_delay_minutes: 7 * 24 * 60 + 1 }],
        ["fractional cents", { review_request_min_amount_cents: 10.5 }],
        ["zero-day frequency cap", { review_request_frequency_cap_days: 0 }],
        ["frequency cap over a year", { review_request_frequency_cap_days: 366 }],
    ])("rejects %s", (_label, patch) => {
        expect(businessPatchSchema.safeParse({ ...settingsPayload, ...patch }).success).toBe(false);
    });

    it("still rejects unknown keys", () => {
        expect(businessPatchSchema.safeParse({ ...settingsPayload, review_request_unknown: 1 }).success).toBe(false);
    });
});
