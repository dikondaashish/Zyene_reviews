/**
 * Pure targeting rules for the free-guide lead wizard (OptiMonk-style smart popup).
 * Everything here is deterministic so it can be unit tested; the browser wiring
 * lives in `use-home-lead-wizard-triggers.ts`.
 */

export const LEAD_WIZARD_CONFIG = {
    /** Never interrupt during the first seconds of a page view. */
    minDelayMs: 4_000,
    /** Exit intent only counts once the visitor has engaged for this long. */
    exitIntentMinEngagedMs: 6_000,
    /** Scroll-depth trigger: fraction of the scrollable page plus a little time on it. */
    scrollDepthRatio: 0.5,
    scrollDepthMinEngagedMs: 10_000,
    /** Fallback for readers who stay without scrolling far. */
    engagedTimeMs: 40_000,
    /** Mobile has no exit intent: open after the visitor goes idle mid-read. */
    mobileInactivityMs: 12_000,
    mobileInactivityMinScrollRatio: 0.25,
    mobileInactivityMinEngagedMs: 15_000,
    /** Frequency capping. */
    dismissCooldownDays: 7,
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
    ],
} as const;

export type LeadWizardConfig = typeof LEAD_WIZARD_CONFIG;
export type LeadWizardTrigger = "exit_intent" | "scroll_depth" | "engaged_time" | "inactivity" | "manual" | "qa";
export type LeadWizardDevice = "desktop" | "mobile";

const DAY_MS = 86_400_000;
const PAID_MEDIUMS = new Set(["cpc", "ppc", "paid", "paid_social", "paidsocial", "display"]);
const CLICK_ID_PARAMS = ["gclid", "fbclid", "msclkid", "ttclid"];

function matchesPrefix(pathname: string, prefix: string): boolean {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isSuppressedPath(pathname: string, config: LeadWizardConfig = LEAD_WIZARD_CONFIG): boolean {
    return config.suppressedPathPrefixes.some((prefix) => matchesPrefix(pathname, prefix));
}

/** Paid visitors land with a job in mind; organic campaign traffic is personalized instead. */
export function isPaidLanding(search: string): boolean {
    const params = new URLSearchParams(search);
    for (const [key, value] of params) {
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

export type LeadWizardMemory = { dismissedAt: number | null; convertedAt: number | null };

export type GateInput = {
    now: number;
    pathname: string;
    search: string;
    memory: LeadWizardMemory;
    shownThisSession: boolean;
    /** Another popup (e.g. the exit-intent offer) already owns this session. */
    popupSlotTaken: boolean;
    chatOpen: boolean;
    cookieBannerOpen: boolean;
    /** Any other dialog (mobile nav, privacy settings, appointment picker) is open. */
    otherOverlayOpen: boolean;
};

export type GateResult =
    | { allowed: true }
    /** `retry` means the block is temporary (chat or cookie banner open), so keep watching. */
    | { allowed: false; reason: string; retry: boolean };

export function evaluateGate(input: GateInput, config: LeadWizardConfig = LEAD_WIZARD_CONFIG): GateResult {
    if (input.memory.convertedAt !== null) return { allowed: false, reason: "converted", retry: false };
    const cooldownMs = config.dismissCooldownDays * DAY_MS;
    if (input.memory.dismissedAt !== null && input.now - input.memory.dismissedAt < cooldownMs) {
        return { allowed: false, reason: "dismissed_recently", retry: false };
    }
    if (input.shownThisSession) return { allowed: false, reason: "session_cap", retry: false };
    if (isSuppressedPath(input.pathname, config)) return { allowed: false, reason: "suppressed_path", retry: false };
    if (isPaidLanding(input.search)) return { allowed: false, reason: "paid_landing", retry: false };
    if (input.popupSlotTaken) return { allowed: false, reason: "popup_slot_taken", retry: false };
    if (input.chatOpen) return { allowed: false, reason: "chat_open", retry: true };
    if (input.cookieBannerOpen) return { allowed: false, reason: "cookie_banner_open", retry: true };
    if (input.otherOverlayOpen) return { allowed: false, reason: "overlay_open", retry: true };
    return { allowed: true };
}

export type TriggerSignals = {
    device: LeadWizardDevice;
    /** Wall-clock time since the page view started. */
    elapsedMs: number;
    /** Time the tab was visible on this page. */
    engagedMs: number;
    /** Deepest scroll ratio reached on this page (0..1). */
    maxScrollRatio: number;
    /** Time since the last scroll, touch, key or pointer activity. */
    idleMs: number;
    exitIntent: boolean;
};

/** Which trigger (if any) fires for the current signals. Exit intent wins because it is the last chance. */
export function evaluateTrigger(
    signals: TriggerSignals,
    config: LeadWizardConfig = LEAD_WIZARD_CONFIG,
): Exclude<LeadWizardTrigger, "manual" | "qa"> | null {
    if (signals.elapsedMs < config.minDelayMs) return null;
    if (signals.device === "desktop" && signals.exitIntent && signals.engagedMs >= config.exitIntentMinEngagedMs) {
        return "exit_intent";
    }
    if (signals.maxScrollRatio >= config.scrollDepthRatio && signals.engagedMs >= config.scrollDepthMinEngagedMs) {
        return "scroll_depth";
    }
    if (
        signals.device === "mobile" &&
        signals.idleMs >= config.mobileInactivityMs &&
        signals.maxScrollRatio >= config.mobileInactivityMinScrollRatio &&
        signals.engagedMs >= config.mobileInactivityMinEngagedMs
    ) {
        return "inactivity";
    }
    if (signals.engagedMs >= config.engagedTimeMs) return "engaged_time";
    return null;
}

/** Desktop exit intent: the pointer leaves through the top edge of the viewport. */
export function isExitIntentEvent(event: { clientY: number; relatedTarget: unknown }): boolean {
    return event.relatedTarget === null && event.clientY <= 0;
}
