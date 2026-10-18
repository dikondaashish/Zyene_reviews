"use client";

import { useCallback, useEffect, useRef, type Dispatch, type SetStateAction } from "react";

const SEEN_KEY = "zyene-home-book-wizard-seen";
/** Open once the visitor has scrolled through ~60% of the page. */
const SCROLL_DEPTH_RATIO = 0.6;
const CLICK_ID_PARAMS = new Set(["gclid", "fbclid"]);

function storageHasSeen() {
    try {
        return window.localStorage.getItem(SEEN_KEY) === "1";
    } catch {
        return false;
    }
}

function markSeen() {
    try {
        window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
        // The wizard still works when storage is unavailable.
    }
}

/** Paid and campaign visitors land with a job in mind, so the popup never interrupts them. */
export function hasCampaignParams(search: string): boolean {
    for (const key of new URLSearchParams(search).keys()) {
        const name = key.toLowerCase();
        if (name.startsWith("utm_") || CLICK_ID_PARAMS.has(name)) return true;
    }
    return false;
}

/** True once the scroll position is past `ratio` of the page's scrollable distance. */
export function hasReachedScrollDepth(
    scrollY: number,
    viewportHeight: number,
    pageHeight: number,
    ratio = SCROLL_DEPTH_RATIO,
): boolean {
    const scrollable = pageHeight - viewportHeight;
    if (scrollable <= 0) return false;
    return scrollY / scrollable >= ratio;
}

export function useHomeLeadWizardTiming(setOpen: Dispatch<SetStateAction<boolean>>) {
    const stopWatchingRef = useRef<(() => void) | null>(null);

    const cancelDelayedOpen = useCallback(() => {
        stopWatchingRef.current?.();
        stopWatchingRef.current = null;
    }, []);

    useEffect(() => {
        const search = window.location.search;
        if (new URLSearchParams(search).get("qa") === "wizard") {
            const previewTimer = window.setTimeout(() => setOpen(true), 0);
            return () => window.clearTimeout(previewTimer);
        }
        if (process.env.NODE_ENV !== "production") return;
        if (storageHasSeen() || hasCampaignParams(search)) return;

        let frame: number | null = null;

        function stop() {
            window.removeEventListener("scroll", onScroll);
            if (frame !== null) window.cancelAnimationFrame(frame);
            frame = null;
        }

        function checkDepth() {
            frame = null;
            const pageHeight = document.documentElement.scrollHeight;
            if (!hasReachedScrollDepth(window.scrollY, window.innerHeight, pageHeight)) return;
            stop();
            stopWatchingRef.current = null;
            markSeen();
            setOpen(true);
        }

        function onScroll() {
            if (frame === null) frame = window.requestAnimationFrame(checkDepth);
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        stopWatchingRef.current = stop;
        return cancelDelayedOpen;
    }, [cancelDelayedOpen, setOpen]);

    return cancelDelayedOpen;
}
