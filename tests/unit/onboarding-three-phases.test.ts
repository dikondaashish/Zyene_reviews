import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { ONBOARDING_PHASES, ONBOARDING_STEP, onboardingPhaseIndex } from "@/app/onboarding/onboarding-types";
import { shouldRenameWorkspace } from "@/services/onboarding/name-default-workspace";
import { AUTOMATE_OPTIONS, availableOptions, replyRulesPayload } from "@/components/onboarding/step-automate-options";

const source = (file: string) => readFileSync(path.join(process.cwd(), file), "utf8");

describe("onboarding phases", () => {
    it("shows about you, connect, results, plan, automate, all set in that order", () => {
        expect(ONBOARDING_PHASES.map((p) => p.label)).toEqual(["About you", "Connect", "Your results", "Plan", "Automate", "All set"]);
        const order = [ONBOARDING_STEP.about, ONBOARDING_STEP.business, ONBOARDING_STEP.details, ONBOARDING_STEP.results, ONBOARDING_STEP.plan, ONBOARDING_STEP.automate, ONBOARDING_STEP.done];
        expect(order.map(onboardingPhaseIndex)).toEqual([0, 1, 1, 2, 3, 4, 5]);
    });

    it("keeps the stored ids existing users already have", () => {
        expect(ONBOARDING_STEP).toMatchObject({ business: 2, details: 3, plan: 4, done: 5 });
        expect(onboardingPhaseIndex(0)).toBe(0);
    });

    it("starts with About you, returns there while the mobile number is missing, then routes through results and automate", () => {
        const data = source("src/app/onboarding/use-onboarding-data.ts");
        expect(data).toContain("stored <= ONBOARDING_STEP.about || missingPhone ? ONBOARDING_STEP.about : stored");
        expect(data).toContain("!userData?.phone?.trim() && stored < ONBOARDING_STEP.done");
        expect(source("src/app/actions/onboarding/business.ts")).toContain("onboarding_step: googleRow?.google_location_id ? 6 : 4");
        expect(source("src/app/actions/onboarding/billing.ts")).toContain("onboarding_step: 7");
        expect(source("src/app/onboarding/use-onboarding-url-effects.ts")).not.toContain("setCurrentStep(5)");
    });
});

describe("workspace naming", () => {
    it("renames only the signup default, once a real business name is known", () => {
        expect(shouldRenameWorkspace("Kevin Hill's Org", "Wolfpack BBQ & Burgers")).toBe(true);
        expect(shouldRenameWorkspace("Kevin Hill's Org", "Kevin Hill's Business")).toBe(false);
        expect(shouldRenameWorkspace("Acme Group", "Wolfpack BBQ & Burgers")).toBe(false);
        expect(shouldRenameWorkspace("Kevin Hill's Org", "  ")).toBe(false);
    });
});

describe("automate choices", () => {
    it("only offers automatic posting on plans that allow it", () => {
        expect(availableOptions(false).map((o) => o.id)).toEqual(["approve_all", "manual"]);
        expect(availableOptions(true).map((o) => o.id)).toEqual(["recommended", "approve_all", "manual"]);
    });

    it("writes one rule per star, with approval for anything below 4 stars", () => {
        const recommended = AUTOMATE_OPTIONS.find((o) => o.id === "recommended")!;
        const body = replyRulesPayload("b1", recommended);
        expect(body.enabled).toBe(true);
        expect(body.rules).toEqual([
            { rating: 5, action: "auto", templateId: null },
            { rating: 4, action: "auto", templateId: null },
            { rating: 3, action: "approval", templateId: null },
            { rating: 2, action: "approval", templateId: null },
            { rating: 1, action: "approval", templateId: null },
        ]);
        expect(body.approverUserIds).toEqual([]);
    });

    it("leaves reply rules off when the owner replies themselves", () => {
        const manual = AUTOMATE_OPTIONS.find((o) => o.id === "manual")!;
        const body = replyRulesPayload("b1", manual);
        expect(body.enabled).toBe(false);
        expect(body.rules.every((r) => r.action === "approval")).toBe(true);
    });
});
