import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

vi.mock("@/hooks/use-google-sync-remote-state", () => ({ useGoogleSyncRemoteState: () => ({}) }));

import { buildWelcomeSlides } from "@/components/dashboard/welcome-tour/welcome-tour-slides";

const source = (file: string) => readFileSync(path.join(process.cwd(), file), "utf8");
const data = {
    businessId: "b1",
    firstName: "Kevin",
    businessName: "Wolfpack BBQ",
    reviewLink: "https://collectratings.com/wolfpack",
    googleConnected: true,
    replyRules: [],
};
const noop = { importCustomers: () => {}, replyRules: () => {} };

describe("first-run welcome", () => {
    it("ends onboarding in the real dashboard, not a separate page", () => {
        const finish = source("src/components/onboarding/use-step5-form.ts");
        expect(finish).toContain('WELCOME_URL = "/dashboard?welcome=1"');
        expect(finish.indexOf("completeOnboarding(businessId)")).toBeLessThan(finish.indexOf("router.replace(WELCOME_URL)"));
        expect(source("src/app/(dashboard)/dashboard/page.tsx")).toContain('sp.welcome === "1"');
    });

    it("tells the story in five short slides, starting with Great work", () => {
        const slides = buildWelcomeSlides(data, noop);
        expect(slides.map((s) => s.title)).toEqual([
            "Great work, Kevin!",
            "Your review link",
            "Ask your past customers",
            "Replies, with you in control",
            "We make a great team",
        ]);
    });

    it("never starts the spotlight tour by itself on the welcome visit", () => {
        expect(source("src/components/tours/use-dashboard-tour-state.ts")).toContain('if (searchParams.get("welcome") === "1") return;');
        const dialog = source("src/components/dashboard/welcome-tour/welcome-tour-dialog.tsx");
        expect(dialog).toContain('finish("/dashboard?tour=true", true)');
        expect(dialog).toContain("if (!runTour) await completeTour()");
    });

    it("keeps the milestone pop-up out of the welcome visit", () => {
        const view = source("src/app/(dashboard)/dashboard/dashboard-view.tsx");
        expect(view).toMatch(/props\.welcome \? \([\s\S]*WelcomeTourDialog[\s\S]*MilestoneCelebration/);
    });
});
