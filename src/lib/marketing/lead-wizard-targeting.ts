/**
 * Who may see the lead wizard and when it must stay away (suppression + adaptive frequency
 * capping). Pure functions; `lead-wizard-intent.ts` decides the moment, this decides the gate.
 */

import type { LeadWizardGoal, LeadWizardIndustry } from "@/lib/marketing/lead-wizard-personalization";

export const LEAD_WIZARD_CONFIG = {
    /** Cooldown after each successive dismissal; past the end of the list it never auto-opens again. */
    dismissCooldownDays: [7, 30] as readonly number[],
    /** Closing on the email step shows real interest, so it comes back sooner (and resumes there). */
    emailStepCooldownDays: 3,
    /** Lifetime cap on automatic opens per browser. */
    maxAutoViews: 4,
    /** Path prefixes where a popup would get in the way of a decision already being made. */
    suppressedPathPrefixes: [
        "/pricing",
        "/signup",
        "/login",
        "/demo",
        "/contact",
        "/growth",
        "/privacy",
        "/terms",
        "/data-retention",
        "/sms-consent",
        "/security",
    ] as readonly string[],
};

export type LeadWizardConfig = typeof LEAD_WIZARD_CONFIG;

const DAY_MS = 86_400_000;
const PAID_MEDIUMS = new Set(["cpc", "ppc", "paid", "paid_social", "paidsocial", "display"]);
const CLICK_ID_PARAMS = ["gclid", "fbclid", "msclkid", "ttclid"];

export function isSuppressedPath(pathname: string, config: LeadWizardConfig = LEAD_WIZARD_CONFIG): boolean {
    return config.suppressedPathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/** Paid visitors land with a job in mind; organic campaign traffic is personalized instead. */
export function isPaidLanding(search: string): boolean {
    for (const [key, value] of new URLSearchParams(search)) {
        const name = key.toLowerCase();
        if (CLICK_ID_PARAMS.includes(name)) return true;
        if (name === "utm_medium" && PAID_MEDIUMS.has(value.toLowerCase())) return true;
    }
    return false;
}

export function scrollRatio(scrollY: number, viewportHeight: number, pageHeight: number): number {
    const scrollable = pageHeight - viewportHeight;
    if (scrollable <= 0) return 0;
    return Math.min(1, Math.max(0, scrollY / scrollable));
}

export type LeadWizardMemory = {
    dismissedAt: number | null;
    convertedAt: number | null;
    dismissCount: number;
    autoViews: number;
    /** Where the last dismissal happened, and the answers given, so the next open can resume. */
    lastStep: "questions" | "email" | null;
    industry?: LeadWizardIndustry;
    goal?: LeadWizardGoal;
};

export const EMPTY_MEMORY: LeadWizardMemory = { dismissedAt: null, convertedAt: null, dismissCount: 0, autoViews: 0, lastStep: null };

/** Days to wait after the latest dismissal; Infinity means stop auto-opening for good. */
export function cooldownDays(memory: LeadWizardMemory, config: LeadWizardConfig = LEAD_WIZARD_CONFIG): number {
    if (memory.dismissCount === 0) return 0;
    if (memory.lastStep === "email") return config.emailStepCooldownDays;
    return config.dismissCooldownDays[memory.dismissCount - 1] ?? Number.POSITIVE_INFINITY;
}

/** The visitor left mid-way with answers picked: reopen straight on the email step. */
export function shouldResume(memory: LeadWizardMemory): boolean {
    return memory.lastStep === "email" && Boolean(memory.industry && memory.goal);
}

export type GateInput = {
    now: number;
    pathname: string;
    search: string;
    memory: LeadWizardMemory;
    shownThisSession: boolean;
    /** Another popup (e.g. the exit-intent offer) already owns this session. */
    popupSlotTaken: boolean;
    /** Signed-in customers never need the lead magnet. */
    signedIn: boolean;
    /** Automated browsers (navigator.webdriver) never see it. */
    automated: boolean;
    chatOpen: boolean;
    cookieBannerOpen: boolean;
    /** Any other dialog (mobile nav, privacy settings, appointment picker) is open. */
    otherOverlayOpen: boolean;
};

export type GateResult =
    | { allowed: true }
    /** `retry` means the block is temporary (chat, banner or a dialog open), so keep watching. */
    | { allowed: false; reason: string; retry: boolean };

const block = (reason: string, retry = false): GateResult => ({ allowed: false, reason, retry });

export function evaluateGate(input: GateInput, config: LeadWizardConfig = LEAD_WIZARD_CONFIG): GateResult {
    const { memory } = input;
    if (memory.convertedAt !== null) return block("converted");
    if (input.signedIn) return block("signed_in");
    if (input.automated) return block("automated");
    if (memory.autoViews >= config.maxAutoViews) return block("lifetime_cap");
    if (memory.dismissedAt !== null && input.now - memory.dismissedAt < cooldownDays(memory, config) * DAY_MS) {
        return block("cooldown");
    }
    if (input.shownThisSession) return block("session_cap");
    if (isSuppressedPath(input.pathname, config)) return block("suppressed_path");
    if (isPaidLanding(input.search)) return block("paid_landing");
    if (input.popupSlotTaken) return block("popup_slot_taken");
    if (input.chatOpen) return block("chat_open", true);
    if (input.cookieBannerOpen) return block("cookie_banner_open", true);
    if (input.otherOverlayOpen) return block("overlay_open", true);
    return { allowed: true };
}
