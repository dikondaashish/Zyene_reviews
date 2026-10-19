import { describe, expect, it } from "vitest";
import {
    evaluateGate,
    evaluateTrigger,
    isExitIntentEvent,
    isPaidLanding,
    isSuppressedPath,
    LEAD_WIZARD_CONFIG,
    scrollRatio,
    type GateInput,
    type TriggerSignals,
} from "@/lib/marketing/lead-wizard-targeting";

const DAY = 86_400_000;
const NOW = 1_800_000_000_000;

function gate(overrides: Partial<GateInput> = {}): GateInput {
    return {
        now: NOW,
        pathname: "/",
        search: "",
        memory: { dismissedAt: null, convertedAt: null },
        shownThisSession: false,
        popupSlotTaken: false,
        chatOpen: false,
        cookieBannerOpen: false,
        otherOverlayOpen: false,
        ...overrides,
    };
}

function signals(overrides: Partial<TriggerSignals> = {}): TriggerSignals {
    return { device: "desktop", elapsedMs: 60_000, engagedMs: 0, maxScrollRatio: 0, idleMs: 0, exitIntent: false, ...overrides };
}

describe("lead wizard suppression", () => {
    it.each(["/pricing", "/pricing/checkout", "/signup", "/demo", "/contact", "/growth/leads", "/privacy"])("suppresses %s", (path) => {
        expect(isSuppressedPath(path)).toBe(true);
    });

    it.each(["/", "/industries/dental", "/blog/how-to-get-reviews", "/pricingx", "/features/ai-replies"])("allows %s", (path) => {
        expect(isSuppressedPath(path)).toBe(false);
    });

    it.each(["?gclid=abc", "?fbclid=1", "?utm_medium=cpc&utm_source=google", "?UTM_MEDIUM=Paid_Social"])("treats %s as paid", (search) => {
        expect(isPaidLanding(search)).toBe(true);
    });

    it.each(["", "?utm_source=newsletter&utm_medium=email", "?ref=partner", "?qa=wizard"])("does not treat %s as paid", (search) => {
        expect(isPaidLanding(search)).toBe(false);
    });
});

describe("lead wizard gate", () => {
    it("allows a fresh visitor", () => {
        expect(evaluateGate(gate())).toEqual({ allowed: true });
    });

    it("never shows again after a conversion", () => {
        expect(evaluateGate(gate({ memory: { dismissedAt: null, convertedAt: NOW - 400 * DAY } }))).toMatchObject({
            allowed: false,
            reason: "converted",
            retry: false,
        });
    });

    it("waits out the dismiss cooldown", () => {
        const days = LEAD_WIZARD_CONFIG.dismissCooldownDays;
        expect(evaluateGate(gate({ memory: { dismissedAt: NOW - (days - 1) * DAY, convertedAt: null } })).allowed).toBe(false);
        expect(evaluateGate(gate({ memory: { dismissedAt: NOW - (days + 1) * DAY, convertedAt: null } })).allowed).toBe(true);
    });

    it("caps at one view per session and respects other popups", () => {
        expect(evaluateGate(gate({ shownThisSession: true }))).toMatchObject({ reason: "session_cap", retry: false });
        expect(evaluateGate(gate({ popupSlotTaken: true }))).toMatchObject({ reason: "popup_slot_taken", retry: false });
    });

    it("blocks on suppressed paths and paid landings", () => {
        expect(evaluateGate(gate({ pathname: "/demo" }))).toMatchObject({ reason: "suppressed_path" });
        expect(evaluateGate(gate({ search: "?gclid=1" }))).toMatchObject({ reason: "paid_landing" });
    });

    it("retries while the chat panel or cookie banner is open", () => {
        expect(evaluateGate(gate({ chatOpen: true }))).toEqual({ allowed: false, reason: "chat_open", retry: true });
        expect(evaluateGate(gate({ cookieBannerOpen: true }))).toEqual({ allowed: false, reason: "cookie_banner_open", retry: true });
        expect(evaluateGate(gate({ otherOverlayOpen: true }))).toMatchObject({ reason: "overlay_open", retry: true });
    });
});

describe("lead wizard triggers", () => {
    it("never fires in the first seconds of a page view", () => {
        expect(evaluateTrigger(signals({ elapsedMs: 1_000, engagedMs: 60_000, exitIntent: true, maxScrollRatio: 1 }))).toBeNull();
    });

    it("fires on desktop exit intent after some engagement", () => {
        expect(evaluateTrigger(signals({ exitIntent: true, engagedMs: 2_000 }))).toBeNull();
        expect(evaluateTrigger(signals({ exitIntent: true, engagedMs: 8_000 }))).toBe("exit_intent");
        expect(evaluateTrigger(signals({ device: "mobile", exitIntent: true, engagedMs: 8_000 }))).toBeNull();
    });

    it("fires at 50% scroll depth once engaged", () => {
        expect(evaluateTrigger(signals({ maxScrollRatio: 0.6, engagedMs: 5_000 }))).toBeNull();
        expect(evaluateTrigger(signals({ maxScrollRatio: 0.49, engagedMs: 20_000 }))).toBeNull();
        expect(evaluateTrigger(signals({ maxScrollRatio: 0.5, engagedMs: 12_000 }))).toBe("scroll_depth");
    });

    it("fires on mobile inactivity mid-read only", () => {
        const idle = { device: "mobile" as const, idleMs: 13_000, engagedMs: 16_000 };
        expect(evaluateTrigger(signals({ ...idle, maxScrollRatio: 0.3 }))).toBe("inactivity");
        expect(evaluateTrigger(signals({ ...idle, maxScrollRatio: 0.1 }))).toBeNull();
        expect(evaluateTrigger(signals({ ...idle, device: "desktop", maxScrollRatio: 0.3 }))).toBeNull();
    });

    it("falls back to engaged time", () => {
        expect(evaluateTrigger(signals({ engagedMs: 39_000 }))).toBeNull();
        expect(evaluateTrigger(signals({ engagedMs: 40_000 }))).toBe("engaged_time");
    });

    it("detects exit intent only through the top edge", () => {
        expect(isExitIntentEvent({ clientY: -2, relatedTarget: null })).toBe(true);
        expect(isExitIntentEvent({ clientY: 300, relatedTarget: null })).toBe(false);
        expect(isExitIntentEvent({ clientY: -2, relatedTarget: {} })).toBe(false);
    });

    it("computes a clamped scroll ratio", () => {
        expect(scrollRatio(2000, 800, 4800)).toBe(0.5);
        expect(scrollRatio(0, 900, 600)).toBe(0);
        expect(scrollRatio(9000, 800, 4800)).toBe(1);
    });
});
