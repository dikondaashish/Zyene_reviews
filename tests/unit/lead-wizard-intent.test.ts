import { describe, expect, it } from "vitest";
import {
    decideTrigger,
    intentScore,
    isExitIntentEvent,
    isExitTrajectory,
    isGoodMoment,
    isMobileExitFlick,
    pageIntentWeight,
    type DecisionInput,
    type MomentSignals,
} from "@/lib/marketing/lead-wizard-intent";

const calm: MomentSignals = { typing: false, hasSelection: false, mediaPlaying: false, msSinceScroll: 5_000, msSinceClick: 5_000 };

function decision(overrides: Partial<DecisionInput> = {}): DecisionInput {
    return { device: "desktop", elapsedMs: 60_000, score: 0, idleMs: 0, maxScrollRatio: 0, leaving: null, moment: calm, ...overrides };
}

describe("intent score", () => {
    it("is low for a quick bounce", () => {
        expect(intentScore({ engagedMs: 3_000, sessionEngagedMs: 3_000, maxScrollRatio: 0.05, sessionPages: ["/"], previousVisits: 0 }).total).toBeLessThan(10);
    });

    it("stays below the high-intent bar for one long page on a first visit", () => {
        const score = intentScore({ engagedMs: 90_000, sessionEngagedMs: 90_000, maxScrollRatio: 1, sessionPages: ["/blog/x"], previousVisits: 0 });
        expect(score.total).toBeLessThan(55);
    });

    it("rises with a research journey and return visits", () => {
        const pages = ["/", "/features/ai-replies", "/industries/dental", "/compare"];
        const score = intentScore({ engagedMs: 30_000, sessionEngagedMs: 150_000, maxScrollRatio: 0.6, sessionPages: pages, previousVisits: 1 });
        expect(score.total).toBeGreaterThanOrEqual(55);
        expect(score.research).toBeGreaterThan(0);
        expect(score.loyalty).toBe(10);
    });

    it("weights decision pages above content pages", () => {
        expect(pageIntentWeight("/compare/birdeye")).toBeGreaterThan(pageIntentWeight("/blog/post"));
        expect(pageIntentWeight("/features/ai-replies")).toBeGreaterThan(pageIntentWeight("/about"));
    });
});

describe("natural pauses", () => {
    it("never interrupts typing, selecting, watching, scrolling or clicking", () => {
        expect(isGoodMoment(calm)).toBe(true);
        expect(isGoodMoment({ ...calm, typing: true })).toBe(false);
        expect(isGoodMoment({ ...calm, hasSelection: true })).toBe(false);
        expect(isGoodMoment({ ...calm, mediaPlaying: true })).toBe(false);
        expect(isGoodMoment({ ...calm, msSinceScroll: 300 })).toBe(false);
        expect(isGoodMoment({ ...calm, msSinceClick: 800 })).toBe(false);
    });
});

describe("trigger decision", () => {
    it("never fires in the first seconds", () => {
        expect(decideTrigger(decision({ elapsedMs: 1_000, score: 100, leaving: "exit_intent" }))).toBeNull();
    });

    it("opens on a leaving signal once the visitor engaged a little", () => {
        expect(decideTrigger(decision({ score: 10, leaving: "exit_intent" }))).toBeNull();
        expect(decideTrigger(decision({ score: 25, leaving: "exit_intent" }))).toBe("exit_intent");
        expect(decideTrigger(decision({ score: 25, leaving: "mobile_exit", device: "mobile" }))).toBe("mobile_exit");
        expect(decideTrigger(decision({ score: 25, leaving: "tab_return" }))).toBe("tab_return");
        expect(decideTrigger(decision({ score: 25, leaving: "exit_intent", moment: { ...calm, typing: true } }))).toBeNull();
    });

    it("opens on high intent only at a calm moment", () => {
        expect(decideTrigger(decision({ score: 60 }))).toBe("high_intent");
        expect(decideTrigger(decision({ score: 60, moment: { ...calm, msSinceScroll: 200 } }))).toBeNull();
        expect(decideTrigger(decision({ score: 50 }))).toBeNull();
    });

    it("opens for idle mobile readers mid-article", () => {
        const idle = { device: "mobile" as const, idleMs: 13_000, score: 40 };
        expect(decideTrigger(decision({ ...idle, maxScrollRatio: 0.3 }))).toBe("inactivity");
        expect(decideTrigger(decision({ ...idle, maxScrollRatio: 0.1 }))).toBeNull();
        expect(decideTrigger(decision({ ...idle, device: "desktop", maxScrollRatio: 0.3 }))).toBeNull();
    });
});

describe("leaving signals", () => {
    it("detects the pointer leaving through the top edge", () => {
        expect(isExitIntentEvent({ clientY: -2, relatedTarget: null })).toBe(true);
        expect(isExitIntentEvent({ clientY: 300, relatedTarget: null })).toBe(false);
        expect(isExitIntentEvent({ clientY: -2, relatedTarget: {} })).toBe(false);
    });

    it("catches a fast flick to the tab bar but not a move to the nav menu", () => {
        expect(isExitTrajectory([{ y: 300, t: 0 }, { y: 150, t: 60 }, { y: 5, t: 120 }])).toBe(true);
        expect(isExitTrajectory([{ y: 300, t: 0 }, { y: 150, t: 60 }, { y: 40, t: 120 }])).toBe(false);
        expect(isExitTrajectory([{ y: 120, t: 0 }, { y: 60, t: 400 }, { y: 8, t: 800 }])).toBe(false);
    });

    it("reads a quick scroll back up on mobile as leaving", () => {
        expect(isMobileExitFlick({ scrollUpPx: 600, windowMs: 300, viewportHeight: 800, maxScrollRatio: 0.5 })).toBe(true);
        expect(isMobileExitFlick({ scrollUpPx: 200, windowMs: 300, viewportHeight: 800, maxScrollRatio: 0.5 })).toBe(false);
        expect(isMobileExitFlick({ scrollUpPx: 600, windowMs: 300, viewportHeight: 800, maxScrollRatio: 0.1 })).toBe(false);
    });
});
