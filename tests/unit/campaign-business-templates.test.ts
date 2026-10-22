import { describe, expect, it } from "vitest";
import { CAMPAIGN_TEMPLATES } from "@/lib/campaigns/templates";
import { BUSINESS_TYPES, businessTypeFromGoogleCategory, normalizeSavedBusinessType } from "@/lib/campaigns/business-types";
import { groupTemplatesForType } from "@/lib/campaigns/template-grouping";

describe("campaign templates", () => {
    it("has unique ids and keeps the three original ids that other pages link to", () => {
        const ids = CAMPAIGN_TEMPLATES.map((t) => t.id);
        expect(new Set(ids).size).toBe(ids.length);
        expect(ids.slice(0, 3)).toEqual(["post-visit", "appointment-followup", "re-engagement"]);
    });

    it("gives every business type at least two templates", () => {
        for (const { value } of BUSINESS_TYPES) {
            expect(CAMPAIGN_TEMPLATES.filter((t) => t.businessTypes?.includes(value)).length, value).toBeGreaterThanOrEqual(2);
        }
    });

    it("puts the review link in every text, email and enabled reminder", () => {
        for (const t of CAMPAIGN_TEMPLATES) {
            const v = t.defaultValues;
            expect(v.sms_template, `${t.id} sms`).toContain("{review_link}");
            expect(v.email_template, `${t.id} email`).toContain("{review_link}");
            if (v.follow_up_enabled) expect(v.follow_up_template, `${t.id} reminder`).toContain("{review_link}");
        }
    });

    it("never offers a reward for a review", () => {
        const text = CAMPAIGN_TEMPLATES.map((t) => JSON.stringify(t.defaultValues)).join(" ").toLowerCase();
        expect(text).not.toMatch(/discount|coupon|% off|free gift|gift card for|in exchange/);
    });
});

describe("inbox-friendly wording", () => {
    const SAMPLE_LINK = "https://collectratings.com/sunrise-dental-care/r/abcdef1234567890";

    it("writes every email as plain text with exactly one link, greeting by first name", () => {
        for (const t of CAMPAIGN_TEMPLATES) {
            const body = t.defaultValues.email_template;
            expect(body, t.id).not.toMatch(/<[a-z]/i);
            expect(body.split("{review_link}").length - 1, t.id).toBe(1);
            expect(body.startsWith("Hi {first_name},"), t.id).toBe(true);
        }
    });

    it("keeps subjects short, personal and free of sales words", () => {
        for (const t of CAMPAIGN_TEMPLATES) {
            const subject = t.defaultValues.email_subject;
            expect(subject, t.id).toContain("{first_name}");
            expect(subject.length, t.id).toBeLessThanOrEqual(60);
            expect(subject, t.id).not.toMatch(/!|free|offer|deal|limited|urgent|act now|\breview\b|\$/i);
        }
    });

    it("keeps every text message inside one SMS once the link is filled in", () => {
        const tooLong = CAMPAIGN_TEMPLATES.flatMap((t) =>
            [t.defaultValues.sms_template, t.defaultValues.follow_up_template].filter(Boolean).map((message) => {
                const filled = message.replace("{first_name}", "Christopher").replace("{business_name}", "Sunrise Dental Care").replace("{review_link}", SAMPLE_LINK);
                return filled.length > 160 ? `${t.id} (${filled.length}): ${message}` : null;
            }),
        ).filter(Boolean);
        expect(tooLong).toEqual([]);
    });

    it("never promises that a reply reaches the business", () => {
        const text = CAMPAIGN_TEMPLATES.map((t) => JSON.stringify(t.defaultValues)).join(" ").toLowerCase();
        expect(text).not.toMatch(/\breply\b/);
    });
});

describe("business types", () => {
    it("accepts only known saved categories", () => {
        expect(normalizeSavedBusinessType(" Restaurant ")).toBe("restaurant");
        expect(normalizeSavedBusinessType("other")).toBeNull();
        expect(normalizeSavedBusinessType("uncategorized")).toBeNull();
        expect(normalizeSavedBusinessType(null)).toBeNull();
    });

    it.each([
        ["Indian restaurant", "restaurant"],
        ["Coffee shop", "coffee"],
        ["Vape shop", "retail"],
        ["Barber shop", "salon"],
        ["Cosmetic dentist", "dental"],
        ["Day spa", "spa"],
        ["Yoga studio", "gym"],
        ["Auto repair shop", "automotive"],
        ["Chiropractor", "healthcare"],
        ["Boutique hotel", "hotel"],
        ["Sports bar", "restaurant"],
        ["Accounting firm", null],
        ["", null],
    ])("maps Google category %s to %s", (name, type) => {
        expect(businessTypeFromGoogleCategory(name)).toBe(type);
    });
});

describe("groupTemplatesForType", () => {
    it("puts matching templates first and keeps every other template, general ones leading", () => {
        const { matched, others } = groupTemplatesForType(CAMPAIGN_TEMPLATES, "dental");
        expect(matched.every((t) => t.businessTypes?.includes("dental"))).toBe(true);
        expect(matched.length + others.length).toBe(CAMPAIGN_TEMPLATES.length);
        expect(others.slice(0, 3).map((t) => t.id)).toEqual(["post-visit", "appointment-followup", "re-engagement"]);
    });

    it("shows everything when no type is chosen", () => {
        const { matched, others } = groupTemplatesForType(CAMPAIGN_TEMPLATES, null);
        expect(matched).toEqual([]);
        expect(others).toHaveLength(CAMPAIGN_TEMPLATES.length);
    });
});
