import { describe, expect, it } from "vitest";
import {
    cooldownDays,
    EMPTY_MEMORY,
    evaluateGate,
    isPaidLanding,
    isSuppressedPath,
    scrollRatio,
    shouldResume,
    type GateInput,
    type LeadWizardMemory,
} from "@/lib/marketing/lead-wizard-targeting";

const DAY = 86_400_000;
const NOW = 1_800_000_000_000;

function memory(overrides: Partial<LeadWizardMemory> = {}): LeadWizardMemory {
    return { ...EMPTY_MEMORY, ...overrides };
}

function gate(overrides: Partial<GateInput> = {}): GateInput {
    return {
        now: NOW,
        pathname: "/",
        search: "",
        memory: memory(),
        shownThisSession: false,
        popupSlotTaken: false,
        signedIn: false,
        automated: false,
        chatOpen: false,
        cookieBannerOpen: false,
        otherOverlayOpen: false,
        ...overrides,
    };
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

describe("lead wizard adaptive capping", () => {
    it("escalates the cooldown with each dismissal, then stops for good", () => {
        expect(cooldownDays(memory())).toBe(0);
        expect(cooldownDays(memory({ dismissCount: 1 }))).toBe(7);
        expect(cooldownDays(memory({ dismissCount: 2 }))).toBe(30);
        expect(cooldownDays(memory({ dismissCount: 3 }))).toBe(Number.POSITIVE_INFINITY);
    });

    it("brings email-step leavers back sooner and resumes them", () => {
        const leftAtEmail = memory({ dismissCount: 2, lastStep: "email", industry: "restaurant", goal: "reply_faster" });
        expect(cooldownDays(leftAtEmail)).toBe(3);
        expect(shouldResume(leftAtEmail)).toBe(true);
        expect(shouldResume(memory({ lastStep: "email" }))).toBe(false);
    });

    it("waits out the cooldown", () => {
        const dismissed = (days: number) => memory({ dismissCount: 1, dismissedAt: NOW - days * DAY });
        expect(evaluateGate(gate({ memory: dismissed(6) }))).toMatchObject({ reason: "cooldown" });
        expect(evaluateGate(gate({ memory: dismissed(8) })).allowed).toBe(true);
        expect(evaluateGate(gate({ memory: memory({ dismissCount: 3, dismissedAt: NOW - 900 * DAY }) })).allowed).toBe(false);
    });

    it("has a lifetime cap on automatic opens", () => {
        expect(evaluateGate(gate({ memory: memory({ autoViews: 4 }) }))).toMatchObject({ reason: "lifetime_cap" });
    });
});

describe("lead wizard gate", () => {
    it("allows a fresh visitor", () => {
        expect(evaluateGate(gate())).toEqual({ allowed: true });
    });

    it("never shows to converted, signed-in or automated visitors", () => {
        expect(evaluateGate(gate({ memory: memory({ convertedAt: NOW - 400 * DAY }) }))).toMatchObject({ reason: "converted", retry: false });
        expect(evaluateGate(gate({ signedIn: true }))).toMatchObject({ reason: "signed_in", retry: false });
        expect(evaluateGate(gate({ automated: true }))).toMatchObject({ reason: "automated", retry: false });
    });

    it("caps at one view per session and respects other popups", () => {
        expect(evaluateGate(gate({ shownThisSession: true }))).toMatchObject({ reason: "session_cap", retry: false });
        expect(evaluateGate(gate({ popupSlotTaken: true }))).toMatchObject({ reason: "popup_slot_taken", retry: false });
    });

    it("blocks on suppressed paths and paid landings", () => {
        expect(evaluateGate(gate({ pathname: "/demo" }))).toMatchObject({ reason: "suppressed_path" });
        expect(evaluateGate(gate({ search: "?gclid=1" }))).toMatchObject({ reason: "paid_landing" });
    });

    it("retries while the chat panel, cookie banner or another dialog is open", () => {
        expect(evaluateGate(gate({ chatOpen: true }))).toEqual({ allowed: false, reason: "chat_open", retry: true });
        expect(evaluateGate(gate({ cookieBannerOpen: true }))).toEqual({ allowed: false, reason: "cookie_banner_open", retry: true });
        expect(evaluateGate(gate({ otherOverlayOpen: true }))).toMatchObject({ reason: "overlay_open", retry: true });
    });

    it("computes a clamped scroll ratio", () => {
        expect(scrollRatio(2000, 800, 4800)).toBe(0.5);
        expect(scrollRatio(0, 900, 600)).toBe(0);
        expect(scrollRatio(9000, 800, 4800)).toBe(1);
    });
});
