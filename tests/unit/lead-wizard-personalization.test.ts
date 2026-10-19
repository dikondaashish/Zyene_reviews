import { describe, expect, it } from "vitest";
import { guidePreview, nextStepFor, preselectAnswers } from "@/lib/marketing/lead-wizard-personalization";
import { parseLeadWizardMemory } from "@/lib/marketing/lead-wizard-storage";
import { canClaimPopupSlot } from "@/lib/marketing/marketing-popup-slot";

describe("lead wizard preselection", () => {
    it.each([
        ["/industries/restaurants", "restaurant"],
        ["/industries/dental", "healthcare"],
        ["/industries/medical", "healthcare"],
        ["/industries/home-services", "home_services"],
        ["/industries/salons", "other"],
    ])("preselects the business type on %s", (pathname, industry) => {
        expect(preselectAnswers({ pathname }).industry).toBe(industry);
    });

    it("preselects the goal on feature pages", () => {
        expect(preselectAnswers({ pathname: "/features/ai-replies" }).goal).toBe("reply_faster");
        expect(preselectAnswers({ pathname: "/features/review-requests" }).goal).toBe("more_reviews");
        expect(preselectAnswers({ pathname: "/features/review-monitoring" }).goal).toBe("protect_rating");
    });

    it("falls back to UTM campaign words", () => {
        expect(preselectAnswers({ pathname: "/", utm: { utm_campaign: "spring_dental_reply" } })).toEqual({
            industry: "healthcare",
            goal: "reply_faster",
        });
    });

    it("leaves answers open when nothing matches", () => {
        expect(preselectAnswers({ pathname: "/blog/anything", utm: null })).toEqual({ industry: undefined, goal: undefined });
    });
});

describe("lead wizard guide preview", () => {
    it("starts generic", () => {
        const preview = guidePreview();
        expect(preview.title).toBe("The Local Reputation Guide");
        expect(preview.bullets).toHaveLength(3);
    });

    it("reflects both answers", () => {
        const preview = guidePreview("restaurant", "reply_faster");
        expect(preview.title).toBe("Fast Reply Playbook");
        expect(preview.audience).toBe("Restaurants");
        expect(preview.bullets[2]).toMatch(/after the meal/);
    });

    it("picks a next step by goal", () => {
        expect(nextStepFor("more_reviews").kind).toBe("trial");
        expect(nextStepFor("protect_rating").kind).toBe("demo");
        expect(nextStepFor().kind).toBe("trial");
    });
});

describe("lead wizard memory and popup slot", () => {
    it("parses stored memory defensively", () => {
        expect(parseLeadWizardMemory(null)).toEqual({ dismissedAt: null, convertedAt: null });
        expect(parseLeadWizardMemory("not json")).toEqual({ dismissedAt: null, convertedAt: null });
        expect(parseLeadWizardMemory('{"dismissedAt":5,"convertedAt":"x"}')).toEqual({ dismissedAt: 5, convertedAt: null });
    });

    it("lets only one popup own the session", () => {
        expect(canClaimPopupSlot(null, "lead_wizard")).toBe(true);
        expect(canClaimPopupSlot("lead_wizard", "lead_wizard")).toBe(true);
        expect(canClaimPopupSlot("lead_wizard", "exit_intent")).toBe(false);
        expect(canClaimPopupSlot("exit_intent", "lead_wizard")).toBe(false);
    });
});
