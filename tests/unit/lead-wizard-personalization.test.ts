import { describe, expect, it } from "vitest";
import { parseSessionJourney, parseVisitHistory, recordPage, startVisit } from "@/lib/marketing/lead-wizard-journey";
import { guidePreview, nextStepFor, openingCopy, preselectAnswers } from "@/lib/marketing/lead-wizard-personalization";
import { buildLeadWizardSession } from "@/lib/marketing/lead-wizard-session";
import { EMPTY_MEMORY } from "@/lib/marketing/lead-wizard-targeting";
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
        expect(parseLeadWizardMemory(null)).toEqual(EMPTY_MEMORY);
        expect(parseLeadWizardMemory("not json")).toEqual(EMPTY_MEMORY);
        expect(parseLeadWizardMemory('{"dismissedAt":5,"convertedAt":"x","industry":"spaceship"}')).toMatchObject({
            dismissedAt: 5,
            convertedAt: null,
            dismissCount: 1,
            industry: undefined,
        });
    });

    it("lets only one popup own the session", () => {
        expect(canClaimPopupSlot(null, "lead_wizard")).toBe(true);
        expect(canClaimPopupSlot("lead_wizard", "lead_wizard")).toBe(true);
        expect(canClaimPopupSlot("lead_wizard", "exit_intent")).toBe(false);
        expect(canClaimPopupSlot("exit_intent", "lead_wizard")).toBe(false);
    });
});

describe("lead wizard journey", () => {
    it("records distinct consecutive pages and counts visits", () => {
        const journey = recordPage(recordPage(recordPage({ pages: [], engagedMs: 0 }, "/"), "/"), "/pricing");
        expect(journey.pages).toEqual(["/", "/pricing"]);
        expect(startVisit({ visits: 2, lastVisitAt: null }, 9)).toEqual({ visits: 3, lastVisitAt: 9 });
        expect(parseSessionJourney("{bad")).toEqual({ pages: [], engagedMs: 0 });
        expect(parseVisitHistory('{"visits":"x"}')).toEqual({ visits: 0, lastVisitAt: null });
    });

    it("preselects from pages read earlier in the session", () => {
        const journeyPages = ["/industries/restaurants", "/features/review-monitoring", "/blog/x"];
        expect(preselectAnswers({ pathname: "/blog/x", journeyPages })).toEqual({ industry: "restaurant", goal: "protect_rating" });
    });
});

describe("lead wizard opening copy and session", () => {
    it("matches copy to the moment and journey", () => {
        expect(openingCopy({ trigger: "exit_intent", resumed: false, journeyPages: [] }).kicker).toBe("Before you go");
        expect(openingCopy({ trigger: "high_intent", resumed: false, journeyPages: ["/pricing"] }).kicker).toBe("Comparing options?");
        expect(openingCopy({ trigger: "high_intent", resumed: false, journeyPages: [], industry: "healthcare" }).title).toMatch(/clinics/);
        expect(openingCopy({ trigger: "high_intent", resumed: true, journeyPages: [] }).kicker).toBe("Welcome back");
    });

    it("resumes an unfinished visit on the email step with remembered answers", () => {
        const session = buildLeadWizardSession({
            trigger: "high_intent",
            pagePath: "/industries/dental",
            score: 61,
            journeyPages: ["/", "/industries/dental"],
            utm: null,
            memory: { ...EMPTY_MEMORY, dismissCount: 1, lastStep: "email", industry: "restaurant", goal: "reply_faster" },
        });
        expect(session).toMatchObject({ startStep: 2, resumed: true, industry: "restaurant", goal: "reply_faster", suggested: {} });
    });

    it("starts fresh with inferred, suggested answers", () => {
        const session = buildLeadWizardSession({
            trigger: "exit_intent",
            pagePath: "/industries/dental",
            score: 30,
            journeyPages: ["/industries/dental"],
            utm: null,
            memory: EMPTY_MEMORY,
        });
        expect(session).toMatchObject({ startStep: 1, resumed: false, industry: "healthcare", suggested: { industry: "healthcare" } });
    });
});
