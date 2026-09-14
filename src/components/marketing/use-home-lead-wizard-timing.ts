"use client";

import { useCallback, useEffect, useRef, type Dispatch, type SetStateAction } from "react";

const SEEN_KEY = "zyene-home-book-wizard-seen";
const POPUP_DELAY_MS = 12_000;

function storageHasSeen() {
    try {
        return window.localStorage.getItem(SEEN_KEY) === "1";
    } catch {
        return false;
    }
}

export function useHomeLeadWizardTiming(setOpen: Dispatch<SetStateAction<boolean>>) {
    const delayedOpenRef = useRef<number | null>(null);

    const cancelDelayedOpen = useCallback(() => {
        if (delayedOpenRef.current === null) return;
        window.clearTimeout(delayedOpenRef.current);
        delayedOpenRef.current = null;
    }, []);

    useEffect(() => {
        const previewWizard = new URLSearchParams(window.location.search).get("qa") === "wizard";
        if (!previewWizard && process.env.NODE_ENV !== "production") return;
        if (!previewWizard && storageHasSeen()) return;
        if (previewWizard) {
            const previewTimer = window.setTimeout(() => setOpen(true), 0);
            return () => window.clearTimeout(previewTimer);
        }
        delayedOpenRef.current = window.setTimeout(() => {
            delayedOpenRef.current = null;
            try {
                window.localStorage.setItem(SEEN_KEY, "1");
            } catch {
                // The wizard still works when storage is unavailable.
            }
            setOpen(true);
        }, POPUP_DELAY_MS);
        return cancelDelayedOpen;
    }, [cancelDelayedOpen, setOpen]);

    return cancelDelayedOpen;
}
