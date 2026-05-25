import { describe, expect, it } from "vitest";
import { TEMPLATE_PACK_EVENT_NAMES } from "@/lib/marketing/template-pack-events";
import { isTemplatePackQaSubscriber } from "@/lib/marketing/template-pack-qa-filters";

describe("template pack QA filters", () => {
    it("flags QA UTM and prod QA email prefix", () => {
        expect(isTemplatePackQaSubscriber("owner@example.com", "qa", null)).toBe(true);
        expect(isTemplatePackQaSubscriber("owner@example.com", null, "funnel_test")).toBe(true);
        expect(
            isTemplatePackQaSubscriber("template-pack-prod-qa-123@zyenereviews.com", null, null)
        ).toBe(true);
        expect(isTemplatePackQaSubscriber("owner@example.com", "google", "cpc")).toBe(false);
    });
});

describe("template pack conversion", () => {
    it("computes conversion from view and success counts", () => {
        const counts = Object.fromEntries(TEMPLATE_PACK_EVENT_NAMES.map((n) => [n, 0])) as Record<
            (typeof TEMPLATE_PACK_EVENT_NAMES)[number],
            number
        >;
        counts.template_pack_view = 100;
        counts.template_pack_subscribe_success = 7;

        const rate =
            counts.template_pack_view > 0
                ? Math.round((counts.template_pack_subscribe_success / counts.template_pack_view) * 1000) / 10
                : null;

        expect(rate).toBe(7);
    });
});
