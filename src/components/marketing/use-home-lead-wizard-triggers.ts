"use client";

import { useEffect, useRef, type RefObject } from "react";
import { decideTrigger, intentScore, type LeadWizardTrigger, type LeavingSignal } from "@/lib/marketing/lead-wizard-intent";
import { addSessionEngagement, readSessionJourney, trackPageView } from "@/lib/marketing/lead-wizard-journey";
import { detectDevice, watchLeadWizardSignals, type SignalSnapshot } from "@/lib/marketing/lead-wizard-signals";
import { readLeadWizardMemory, wasShownThisSession } from "@/lib/marketing/lead-wizard-storage";
import { evaluateGate } from "@/lib/marketing/lead-wizard-targeting";
import { canClaimPopupSlot, popupSlotOwner } from "@/lib/marketing/marketing-popup-slot";

export type TriggerContext = { trigger: LeadWizardTrigger; score: number; journeyPages: string[] };

function isQaRun(search: string) {
    return new URLSearchParams(search).get("qa") === "wizard-triggers";
}

export function readLeadWizardGate(pathname: string, search: string, signedIn = false) {
    return evaluateGate({
        now: Date.now(),
        pathname,
        search,
        memory: readLeadWizardMemory(),
        shownThisSession: wasShownThisSession(),
        popupSlotTaken: !canClaimPopupSlot(popupSlotOwner(), "lead_wizard"),
        signedIn,
        automated: navigator.webdriver === true && !isQaRun(search),
        chatOpen: document.querySelector(".support-chat-root[data-open]") !== null,
        cookieBannerOpen: document.getElementById("cookie-banner-title") !== null,
        otherOverlayOpen: document.querySelector('[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]') !== null,
    });
}

function autoTriggersEnabled(search: string): boolean {
    return process.env.NODE_ENV === "production" || isQaRun(search);
}

/** The exit-intent offer yields to the lead wizard on pages where the wizard can still show. */
export function leadWizardOwnsExitIntent(pathname: string): boolean {
    const search = window.location.search;
    if (!autoTriggersEnabled(search)) return false;
    const gate = readLeadWizardGate(pathname, search);
    return gate.allowed || gate.retry;
}

/**
 * Scores the visit (this page + session journey + return visits) every second and opens the
 * wizard at a natural pause once intent is high, or on a leaving signal. `?qa=wizard` opens
 * it straight away; `?qa=wizard-triggers` runs the real logic outside production.
 */
export function useHomeLeadWizardTriggers(
    pathname: string,
    signedInRef: RefObject<boolean>,
    onTrigger: (context: TriggerContext) => void,
) {
    const onTriggerRef = useRef(onTrigger);
    useEffect(() => {
        onTriggerRef.current = onTrigger;
    }, [onTrigger]);

    useEffect(() => {
        const search = window.location.search;
        const { journey, previousVisits } = trackPageView(pathname);
        if (new URLSearchParams(search).get("qa") === "wizard") {
            const timer = window.setTimeout(() => onTriggerRef.current({ trigger: "qa", score: 0, journeyPages: journey.pages }), 0);
            return () => window.clearTimeout(timer);
        }
        if (!autoTriggersEnabled(search)) return;
        const initial = readLeadWizardGate(pathname, search, signedInRef.current);
        if (!initial.allowed && !initial.retry) return;

        const device = detectDevice();
        let done = false;

        function consider(snapshot: SignalSnapshot, leaving: LeavingSignal) {
            if (done) return;
            const stored = readSessionJourney();
            const score = intentScore({
                engagedMs: snapshot.engagedMs,
                sessionEngagedMs: stored.engagedMs + snapshot.engagedMs,
                maxScrollRatio: snapshot.maxScrollRatio,
                sessionPages: stored.pages,
                previousVisits,
            }).total;
            const trigger = decideTrigger({ device, score, leaving, ...snapshot });            if (!trigger) return;
            const gate = readLeadWizardGate(pathname, search, signedInRef.current);
            if (!gate.allowed) {
                if (!gate.retry) finish();
                return;
            }
            finish();
            onTriggerRef.current({ trigger, score, journeyPages: stored.pages });
        }

        const watcher = watchLeadWizardSignals(device, {
            onTick: (snapshot) => consider(snapshot, null),
            onLeaving: (signal, snapshot) => consider(snapshot, signal),
        });
        let saved = false;
        function finish() {
            done = true;
            watcher.stop();
            if (!saved) addSessionEngagement(watcher.engagedMs());
            saved = true;
        }
        return finish;
    }, [pathname, signedInRef]);
}
