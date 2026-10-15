"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { isBusinessSlugPath } from "@/lib/routing/platform-routes";
import { ALLOW_ALL, DENY_ALL, type ConsentPreferences } from "@/lib/consent/consent-record";
import {
    OPEN_PREFERENCES_EVENT,
    openCookiePreferences,
    readStoredConsent,
    saveConsent,
    useConsent,
} from "@/lib/consent/consent-store";

/** Customer-facing review pages and embeds are the business's surface, not ours: never overlay them. */
function isSuppressedSurface(): boolean {
    const path = window.location.pathname;
    return (
        path.startsWith("/w/") || path.startsWith("/r/") || isBusinessSlugPath(path) || window.self !== window.top
    );
}

const subscribeNever = () => () => {};

export function useCookieBanner() {
    const consent = useConsent();
    // Re-read on every render (cheap); `true` on the server so SSR never paints the bar.
    const suppressed = useSyncExternalStore(subscribeNever, isSuppressedSurface, () => true);
    const [showPreferences, setShowPreferences] = useState(false);
    const [draft, setDraft] = useState<ConsentPreferences>(DENY_ALL);

    useEffect(() => {
        const open = () => {
            setDraft(readStoredConsent() ?? DENY_ALL);
            setShowPreferences(true);
        };
        window.addEventListener(OPEN_PREFERENCES_EVENT, open);
        return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, open);
    }, []);

    const choose = (prefs: ConsentPreferences) => {
        setShowPreferences(false);
        saveConsent(prefs);
    };

    return {
        // Shown once per browser until a choice exists (on any subdomain), never on embeds.
        showBar: !suppressed && !consent.decided && !showPreferences,
        showPreferences,
        setShowPreferences,
        draft,
        setDraft,
        gpc: consent.gpc,
        openPreferences: openCookiePreferences,
        acceptAll: () => choose(ALLOW_ALL),
        rejectAll: () => choose(DENY_ALL),
        saveDraft: () => choose(draft),
    };
}
