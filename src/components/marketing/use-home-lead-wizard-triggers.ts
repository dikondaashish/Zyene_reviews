"use client";

import { useEffect, useRef } from "react";
import { readLeadWizardMemory, wasShownThisSession } from "@/lib/marketing/lead-wizard-storage";
import {
    evaluateGate,
    evaluateTrigger,
    isExitIntentEvent,
    scrollRatio,
    type LeadWizardTrigger,
} from "@/lib/marketing/lead-wizard-targeting";
import { canClaimPopupSlot, popupSlotOwner } from "@/lib/marketing/marketing-popup-slot";

const TICK_MS = 1_000;
const ACTIVITY_EVENTS = ["pointerdown", "touchstart", "keydown", "wheel"] as const;

export function readLeadWizardGate(pathname: string, search: string) {
    return evaluateGate({
        now: Date.now(),
        pathname,
        search,
        memory: readLeadWizardMemory(),
        shownThisSession: wasShownThisSession(),
        popupSlotTaken: !canClaimPopupSlot(popupSlotOwner(), "lead_wizard"),
        chatOpen: document.querySelector(".support-chat-root[data-open]") !== null,
        cookieBannerOpen: document.getElementById("cookie-banner-title") !== null,
        otherOverlayOpen: document.querySelector('[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]') !== null,
    });
}

function autoTriggersEnabled(search: string): boolean {
    return process.env.NODE_ENV === "production" || new URLSearchParams(search).get("qa") === "wizard-triggers";
}

/** The exit-intent offer yields to the lead wizard on pages where the wizard can still show. */
export function leadWizardOwnsExitIntent(pathname: string): boolean {
    const search = window.location.search;
    if (!autoTriggersEnabled(search)) return false;
    const gate = readLeadWizardGate(pathname, search);
    return gate.allowed || gate.retry;
}

/**
 * Watches exit intent, scroll depth, engaged time and (on mobile) inactivity, then calls
 * `onTrigger` once when a trigger fires and the gate allows it. `?qa=wizard` opens it
 * straight away; `?qa=wizard-triggers` runs the real triggers outside production.
 */
export function useHomeLeadWizardTriggers(pathname: string, onTrigger: (trigger: LeadWizardTrigger) => void) {
    const onTriggerRef = useRef(onTrigger);
    useEffect(() => {
        onTriggerRef.current = onTrigger;
    }, [onTrigger]);

    useEffect(() => {
        const search = window.location.search;
        const qa = new URLSearchParams(search).get("qa");
        if (qa === "wizard") {
            const timer = window.setTimeout(() => onTriggerRef.current("qa"), 0);
            return () => window.clearTimeout(timer);
        }
        if (!autoTriggersEnabled(search)) return;
        const initial = readLeadWizardGate(pathname, search);
        if (!initial.allowed && !initial.retry) return;

        const device = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches ? "mobile" : "desktop";
        const start = performance.now();
        let lastTick = start;
        let lastActivity = start;
        let engagedMs = 0;
        let maxScroll = 0;
        let done = false;

        function check(exitIntent: boolean) {
            if (done) return;
            const now = performance.now();
            if (document.visibilityState === "visible") engagedMs += Math.min(now - lastTick, TICK_MS * 1.5);
            lastTick = now;
            const trigger = evaluateTrigger({
                device,
                elapsedMs: now - start,
                engagedMs,
                maxScrollRatio: maxScroll,
                idleMs: now - lastActivity,
                exitIntent,
            });
            if (!trigger) return;
            const gate = readLeadWizardGate(pathname, search);
            if (!gate.allowed) {
                if (!gate.retry) stop();
                return;
            }
            stop();
            onTriggerRef.current(trigger);
        }

        const onScroll = () => {
            const root = document.documentElement;
            maxScroll = Math.max(maxScroll, scrollRatio(window.scrollY, window.innerHeight, root.scrollHeight));
            lastActivity = performance.now();
        };
        const onActivity = () => {
            lastActivity = performance.now();
        };
        const onMouseOut = (event: MouseEvent) => {
            if (device === "desktop" && isExitIntentEvent(event)) check(true);
        };
        const interval = window.setInterval(() => check(false), TICK_MS);

        window.addEventListener("scroll", onScroll, { passive: true });
        ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, onActivity, { passive: true }));
        document.addEventListener("mouseout", onMouseOut);

        function stop() {
            done = true;
            window.clearInterval(interval);
            window.removeEventListener("scroll", onScroll);
            ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, onActivity));
            document.removeEventListener("mouseout", onMouseOut);
        }
        return stop;
    }, [pathname]);
}
