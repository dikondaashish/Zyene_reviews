import { describe, expect, it } from "vitest";
import { buildInitialPublicProfilePreview } from "@/components/settings/public-profile-editor-initial-preview";
import type { PublicProfileBusinessRecord } from "@/types/components";
import {
    DEFAULT_BRAND_COLOR_HEX,
    DEFAULT_REVIEW_PAGE_BACKGROUND_HEX,
} from "@/lib/utils/review-page-background";

function baseBusiness(
    overrides: Partial<PublicProfileBusinessRecord> = {},
): PublicProfileBusinessRecord {
    return {
        id: "biz_1",
        name: "Demo Clinic",
        ...overrides,
    };
}

describe("buildInitialPublicProfilePreview", () => {
    it("applies defaults for colors and contact modes", () => {
        const preview = buildInitialPublicProfilePreview(baseBusiness(), "demo-slug");

        expect(preview.slug).toBe("demo-slug");
        expect(preview.brand_color).toBe(DEFAULT_BRAND_COLOR_HEX);
        expect(preview.review_page_background_color).toBe(DEFAULT_REVIEW_PAGE_BACKGROUND_HEX);
        expect(preview.private_feedback_email_mode).toBe("optional");
        expect(preview.private_feedback_phone_mode).toBe("hidden");
        expect(preview.private_feedback_offer_mode).toBe("hidden");
        expect(preview.min_stars_for_google).toBe(4);
    });

    it("keeps valid hex background and explicit modes", () => {
        const preview = buildInitialPublicProfilePreview(
            baseBusiness({
                review_page_background_color: "#abc",
                private_feedback_email_mode: "required",
                private_feedback_phone_mode: "optional",
                private_feedback_offer_mode: "visible",
            }),
            "clinic",
        );

        expect(preview.review_page_background_color).toBe("#abc");
        expect(preview.private_feedback_email_mode).toBe("required");
        expect(preview.private_feedback_phone_mode).toBe("optional");
        expect(preview.private_feedback_offer_mode).toBe("visible");
    });

    it("falls back when background color is invalid", () => {
        const preview = buildInitialPublicProfilePreview(
            baseBusiness({ review_page_background_color: "not-a-color" }),
            "x",
        );

        expect(preview.review_page_background_color).toBe(DEFAULT_REVIEW_PAGE_BACKGROUND_HEX);
    });
});
