import { describe, expect, it } from "vitest";

import { activePromptLimitForPlan } from "../../src/services/aeo/prompts/prompt-plan-limit";

describe("activePromptLimitForPlan", () => {
    it.each([
        ["starter_monthly", "active", 5],
        ["starter_yearly", "trialing", 5],
        ["professional_monthly", "active", 15],
        ["professional_yearly", "trialing", 15],
        ["enterprise", "active", 25],
    ])("maps %s/%s to %i prompts", (plan, status, expected) => {
        expect(activePromptLimitForPlan(plan, status)).toBe(expected);
    });

    it.each([
        ["free", "active"],
        ["starter_monthly", "past_due"],
        [null, null],
    ])("blocks an ineligible %s/%s subscription", (plan, status) => {
        expect(activePromptLimitForPlan(plan, status)).toBe(0);
    });
});
