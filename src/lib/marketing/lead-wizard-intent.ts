/**
 * Behavioral intent engine for the lead wizard. Instead of one fixed timer, the visit is
 * scored from engagement across the whole session, and the wizard only opens at a natural
 * pause (or on a strong leaving signal). Pure functions; the browser collector feeds them.
 */

export const LEAD_WIZARD_TRIGGERS = [
    "exit_intent",
    "mobile_exit",
    "tab_return",
    "high_intent",
    "inactivity",
    "manual",
    "qa",
] as const;
export type LeadWizardTrigger = (typeof LEAD_WIZARD_TRIGGERS)[number];
export type LeadWizardDevice = "desktop" | "mobile";

export const INTENT_CONFIG = {
    minDelayMs: 4_000,
    /** Score needed to open at a calm moment with no leaving signal. */
    highIntentScore: 55,
    /** Leaving is the last chance, so a lighter bar applies. */
    exitScore: 20,
    /** Mobile readers who stop mid-article. */
    inactivityMs: 12_000,
    inactivityScore: 35,
    /** A "natural pause": no scroll and no click for this long. */
    pauseAfterScrollMs: 1_200,
    pauseAfterClickMs: 2_500,
    /** Coming back to the tab after this long away reads as renewed attention. */
    tabReturnMinHiddenMs: 10_000,
} as const;

/** Pages that signal buying research, weighted by how close they are to a decision. */
const PAGE_WEIGHTS: [string, number][] = [
    ["/pricing", 10],
    ["/compare", 10],
    ["/demo", 8],
    ["/features", 7],
    ["/industries", 7],
    ["/how-it-works", 6],
    ["/case-studies", 6],
    ["/integrations", 5],
    ["/blog", 4],
    ["/resources", 4],
];

export function pageIntentWeight(pathname: string): number {
    if (pathname === "/") return 3;
    return PAGE_WEIGHTS.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`))?.[1] ?? 2;
}

export type IntentSignals = {
    /** Visible time on this page. */
    engagedMs: number;
    /** Visible time across the session, this page included. */
    sessionEngagedMs: number;
    maxScrollRatio: number;
    /** Distinct pages seen this session, current one included. */
    sessionPages: string[];
    /** Visits (sessions) before this one. */
    previousVisits: number;
};

export type IntentBreakdown = { total: number; page: number; scroll: number; journey: number; research: number; loyalty: number };

const clamp = (value: number, max: number) => Math.max(0, Math.min(max, value));

/** 0..100: how much this visitor has invested in the site so far. */
export function intentScore(s: IntentSignals): IntentBreakdown {
    const page = clamp((s.engagedMs / 60_000) * 25, 25);
    const scroll = clamp((s.maxScrollRatio / 0.75) * 20, 20);
    const extraPages = Math.max(0, new Set(s.sessionPages).size - 1);
    const journey = clamp(extraPages * 6 + (s.sessionEngagedMs / 180_000) * 5, 20);
    const research = clamp(
        [...new Set(s.sessionPages)].reduce((sum, path) => sum + pageIntentWeight(path), 0) - 3,
        20,
    );
    const loyalty = s.previousVisits >= 2 ? 15 : s.previousVisits === 1 ? 10 : 0;
    const total = Math.round(page + scroll + journey + research + loyalty);
    return { total: Math.min(100, total), page, scroll, journey, research, loyalty };
}

export type MomentSignals = {
    typing: boolean;
    hasSelection: boolean;
    mediaPlaying: boolean;
    msSinceScroll: number;
    msSinceClick: number;
};

/** Never interrupt someone typing, selecting text, watching a video, scrolling, or clicking. */
export function isGoodMoment(m: MomentSignals, config = INTENT_CONFIG): boolean {
    return (
        !m.typing &&
        !m.hasSelection &&
        !m.mediaPlaying &&
        m.msSinceScroll >= config.pauseAfterScrollMs &&
        m.msSinceClick >= config.pauseAfterClickMs
    );
}

export type LeavingSignal = "exit_intent" | "mobile_exit" | "tab_return" | null;

export type DecisionInput = {
    device: LeadWizardDevice;
    elapsedMs: number;
    score: number;
    idleMs: number;
    maxScrollRatio: number;
    leaving: LeavingSignal;
    moment: MomentSignals;
};

/** Which trigger fires now, if any. A leaving signal wins because it is the last chance. */
export function decideTrigger(input: DecisionInput, config = INTENT_CONFIG): LeadWizardTrigger | null {
    if (input.elapsedMs < config.minDelayMs) return null;
    if (input.leaving && input.score >= config.exitScore && !input.moment.typing && !input.moment.mediaPlaying) {
        return input.leaving;
    }
    if (!isGoodMoment(input.moment, config)) return null;
    if (input.score >= config.highIntentScore) return "high_intent";
    if (
        input.device === "mobile" &&
        input.idleMs >= config.inactivityMs &&
        input.maxScrollRatio >= 0.25 &&
        input.score >= config.inactivityScore
    ) {
        return "inactivity";
    }
    return null;
}

/** Desktop: the pointer leaves through the top edge of the viewport. */
export function isExitIntentEvent(event: { clientY: number; relatedTarget: unknown }): boolean {
    return event.relatedTarget === null && event.clientY <= 0;
}

export type PointerSample = { y: number; t: number };

/** Desktop: a fast upward flick toward the tab bar, caught before the pointer even leaves. */
export function isExitTrajectory(samples: PointerSample[]): boolean {
    if (samples.length < 3) return false;
    const last = samples[samples.length - 1];
    const first = samples.find((sample) => last.t - sample.t <= 150) ?? samples[0];
    const dt = last.t - first.t;
    // Only at the very edge, so a quick move to the site's own nav menu never counts.
    if (dt <= 0 || last.y > 12) return false;
    return (first.y - last.y) / dt >= 1.5;
}

/** Mobile: a quick scroll back up after reading a while usually precedes back/close. */
export function isMobileExitFlick(input: { scrollUpPx: number; windowMs: number; viewportHeight: number; maxScrollRatio: number }): boolean {
    return input.maxScrollRatio >= 0.3 && input.windowMs <= 450 && input.scrollUpPx >= input.viewportHeight * 0.6;
}
