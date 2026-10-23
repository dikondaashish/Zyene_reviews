import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const source = (file: string) => readFileSync(path.join(process.cwd(), file), "utf8");

describe("onboarding welcome screen", () => {
    const hook = source("src/components/onboarding/use-step5-form.ts");

    it("ends setup on one screen: the tour only runs when the owner asks", () => {
        expect(hook).toContain('if (destination !== "tour") await completeTour()');
        expect(hook).toContain('tour: "/dashboard?tour=true"');
        expect(source("src/components/onboarding/step5-form-cta.tsx")).toContain("Show me around first (1 minute)");
    });

    it("finishes onboarding before leaving for the calendar or requests", () => {
        expect(hook).toContain('calendar: "/automations/calendar"');
        expect(hook).toContain('requests: "/requests"');
        expect(hook.indexOf("completeOnboarding(businessId)")).toBeLessThan(hook.indexOf("router.push"));
    });

    it("sets expectations instead of filler ticks", () => {
        const screen = source("src/components/onboarding/step5-form-celebration.tsx");
        expect(screen).not.toContain("Review templates ready");
        expect(screen).toContain("activity calendar");
        expect(screen).toContain("the first ones often take a few days");
    });
});
