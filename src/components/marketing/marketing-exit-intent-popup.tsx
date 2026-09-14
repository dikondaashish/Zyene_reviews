"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { EXIT_INTENT_SOURCE } from "@/lib/marketing/exit-intent-events";
import { trackMarketingEventClient } from "@/lib/marketing/track-marketing-event-client";

const SEEN_KEY = "zyene-exit-intent-popup-seen";
const MIN_ENGAGEMENT_MS = 5_000;

function wasSeenThisSession() {
    try {
        return window.sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
        return false;
    }
}

function markSeenThisSession() {
    try {
        window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
        // The popup still works when session storage is unavailable.
    }
}

export function MarketingExitIntentPopup() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const shownRef = useRef(false);

    useEffect(() => {
        if (!pathname || pathname === "/" || pathname === "/growth" || pathname.startsWith("/growth/")) return;
        if (wasSeenThisSession()) return;

        let ready = false;
        const readyTimer = window.setTimeout(() => {
            ready = true;
        }, MIN_ENGAGEMENT_MS);
        const onMouseOut = (event: MouseEvent) => {
            if (!ready || shownRef.current || event.relatedTarget !== null || event.clientY > 0) return;
            shownRef.current = true;
            markSeenThisSession();
            setOpen(true);
            trackMarketingEventClient("exit_intent_view", {
                pagePath: pathname,
                source: EXIT_INTENT_SOURCE,
                oncePerSession: true,
            });
        };

        document.addEventListener("mouseout", onMouseOut);
        return () => {
            window.clearTimeout(readyTimer);
            document.removeEventListener("mouseout", onMouseOut);
        };
    }, [pathname]);

    if (!open) return null;

    const trackAction = (eventName: "exit_intent_dismiss" | "exit_intent_cta_click") => {
        trackMarketingEventClient(eventName, {
            pagePath: pathname ?? window.location.pathname,
            source: EXIT_INTENT_SOURCE,
        });
    };

    return (
        <aside className="marketing-exit-popup" role="dialog" aria-labelledby="marketing-exit-popup-title">
            <button
                type="button"
                className="marketing-exit-popup-close"
                aria-label="Close offer"
                onClick={() => {
                    trackAction("exit_intent_dismiss");
                    setOpen(false);
                }}
            >
                <X className="size-4" aria-hidden="true" />
            </button>
            <p className="marketing-exit-popup-kicker">Before you go</p>
            <h2 id="marketing-exit-popup-title">Get more reviews without more busywork.</h2>
            <p>See how Zyene Reviews brings requests, replies, and reputation insights into one calmer workflow.</p>
            <Link
                href="/demo"
                className="marketing-exit-popup-cta"
                onClick={() => trackAction("exit_intent_cta_click")}
            >
                See it in action <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
        </aside>
    );
}
