"use client";

/**
 * Browser-side signal collector for the lead wizard: engagement, scroll depth, pauses,
 * typing/selection/media, and leaving signals (exit trajectory, mobile scroll-flick,
 * tab return). Raw signals only; `lead-wizard-intent.ts` decides what they mean.
 */

import {
    INTENT_CONFIG,
    isExitIntentEvent,
    isExitTrajectory,
    isMobileExitFlick,
    type LeadWizardDevice,
    type LeavingSignal,
    type MomentSignals,
    type PointerSample,
} from "@/lib/marketing/lead-wizard-intent";
import { scrollRatio } from "@/lib/marketing/lead-wizard-targeting";

export type SignalSnapshot = {
    elapsedMs: number;
    engagedMs: number;
    maxScrollRatio: number;
    idleMs: number;
    moment: MomentSignals;
};

type Watcher = { onTick: (snapshot: SignalSnapshot) => void; onLeaving: (signal: Exclude<LeavingSignal, null>, snapshot: SignalSnapshot) => void };

const TICK_MS = 1_000;
const ACTIVITY_EVENTS = ["pointerdown", "touchstart", "keydown", "wheel"] as const;

function isTyping(): boolean {
    const el = document.activeElement;
    return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || (el instanceof HTMLElement && el.isContentEditable);
}

function mediaPlaying(): boolean {
    return [...document.querySelectorAll("video, audio")].some((m) => m instanceof HTMLMediaElement && !m.paused && !m.muted);
}

export function detectDevice(): LeadWizardDevice {
    return window.matchMedia("(max-width: 767px), (pointer: coarse)").matches ? "mobile" : "desktop";
}

export function watchLeadWizardSignals(device: LeadWizardDevice, watcher: Watcher): { stop: () => void; engagedMs: () => number } {
    const start = performance.now();
    let lastTick = start, lastActivity = start, lastScroll = start - 10_000, lastClick = start - 10_000;
    let engaged = 0, hiddenAt: number | null = null, lastScrollY = window.scrollY;
    // Restored scroll positions (reload, back button) count without waiting for a scroll event.
    let maxScroll = scrollRatio(window.scrollY, window.innerHeight, document.documentElement.scrollHeight);
    let pointer: PointerSample[] = [];
    let scrollMarks: { y: number; t: number }[] = [];

    const snapshot = (): SignalSnapshot => {
        const now = performance.now();
        if (document.visibilityState === "visible") engaged += Math.min(now - lastTick, TICK_MS * 1.5);
        lastTick = now;
        // Sample position too: scroll events can be throttled or skipped (background tabs, jump links).
        if (window.scrollY !== lastScrollY) {
            lastScrollY = window.scrollY;
            lastScroll = lastActivity = now;
        }
        maxScroll = Math.max(maxScroll, scrollRatio(window.scrollY, window.innerHeight, document.documentElement.scrollHeight));
        return {
            elapsedMs: now - start,
            engagedMs: engaged,
            maxScrollRatio: maxScroll,
            idleMs: now - lastActivity,
            moment: {
                typing: isTyping(),
                hasSelection: (window.getSelection()?.toString().trim().length ?? 0) > 0,
                mediaPlaying: mediaPlaying(),
                msSinceScroll: now - lastScroll,
                msSinceClick: now - lastClick,
            },
        };
    };
    const leave = (signal: Exclude<LeavingSignal, null>) => watcher.onLeaving(signal, snapshot());

    const onScroll = () => {
        const now = performance.now();
        lastScroll = lastActivity = now;
        maxScroll = Math.max(maxScroll, scrollRatio(window.scrollY, window.innerHeight, document.documentElement.scrollHeight));
        scrollMarks = [...scrollMarks.filter((m) => now - m.t <= 450), { y: window.scrollY, t: now }];
        const top = Math.max(...scrollMarks.map((m) => m.y));
        if (device === "mobile" && isMobileExitFlick({ scrollUpPx: top - window.scrollY, windowMs: now - scrollMarks[0].t, viewportHeight: window.innerHeight, maxScrollRatio: maxScroll })) {
            scrollMarks = [];
            leave("mobile_exit");
        }
    };
    const onActivity = (event: Event) => {
        lastActivity = performance.now();
        if (event.type === "pointerdown") lastClick = lastActivity;
    };
    const onMouseMove = (event: MouseEvent) => {
        const now = performance.now();
        pointer = [...pointer.filter((s) => now - s.t <= 200), { y: event.clientY, t: now }];
        if (isExitTrajectory(pointer)) {
            pointer = [];
            leave("exit_intent");
        }
    };
    const onMouseOut = (event: MouseEvent) => {
        if (isExitIntentEvent(event)) leave("exit_intent");
    };
    const onVisibility = () => {
        const now = performance.now();
        if (document.visibilityState === "hidden") {
            hiddenAt = now;
            return;
        }
        lastTick = now;
        const away = hiddenAt === null ? 0 : now - hiddenAt;
        hiddenAt = null;
        if (away >= INTENT_CONFIG.tabReturnMinHiddenMs) leave("tab_return");
    };

    const interval = window.setInterval(() => watcher.onTick(snapshot()), TICK_MS);
    window.addEventListener("scroll", onScroll, { passive: true });
    ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, onActivity, { passive: true }));
    document.addEventListener("visibilitychange", onVisibility);
    if (device === "desktop") {
        document.addEventListener("mousemove", onMouseMove, { passive: true });
        document.addEventListener("mouseout", onMouseOut);
    }

    return {
        engagedMs: () => engaged,
        stop: () => {
            window.clearInterval(interval);
            window.removeEventListener("scroll", onScroll);
            ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, onActivity));
            document.removeEventListener("visibilitychange", onVisibility);
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseout", onMouseOut);
        },
    };
}
