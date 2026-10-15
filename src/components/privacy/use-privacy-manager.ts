"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { isBusinessSlugPath } from "@/lib/routing/platform-routes";
import { ALLOW_ALL, DENY_ALL } from "@/lib/privacy/consent-record";
import {
    OPEN_SETTINGS_EVENT,
    getPrivacyState,
    openPrivacySettings,
    savePrivacyChoice,
    usePrivacy,
} from "@/lib/privacy/privacy-store";
import type { ConsentPreferences } from "@/lib/privacy/types";

/** Customer-facing review pages and embeds are the business's surface, not ours: never overlay them. */
function isSuppressedSurface(): boolean {
    const path = window.location.pathname;
    return path.startsWith("/w/") || path.startsWith("/r/") || isBusinessSlugPath(path) || window.self !== window.top;
}

const subscribeNever = () => () => {};

export function usePrivacyManager() {
    const privacy = usePrivacy();
    // `true` on the server so SSR never paints the banner.
    const suppressed = useSyncExternalStore(subscribeNever, isSuppressedSurface, () => true);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [draft, setDraft] = useState<ConsentPreferences>(DENY_ALL);
    // Opened by a custom event (no Radix Trigger), so focus restoration is ours to do.
    const opener = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const open = () => {
            opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            // Start from what is in force now (US defaults included), so the switches tell the truth.
            setDraft(getPrivacyState().granted);
            setSettingsOpen(true);
        };
        window.addEventListener(OPEN_SETTINGS_EVENT, open);
        return () => window.removeEventListener(OPEN_SETTINGS_EVENT, open);
    }, []);

    const choose = (prefs: ConsentPreferences) => {
        setSettingsOpen(false);
        savePrivacyChoice(prefs);
    };

    return {
        privacy,
        // Once per browser until a choice exists on any subdomain; never on embeds or in opt-out regions.
        showBanner: !suppressed && privacy.showBanner && !settingsOpen,
        settingsOpen,
        restoreFocus: (event: Event) => {
            if (!opener.current?.isConnected) return;
            event.preventDefault();
            opener.current.focus();
        },
        setSettingsOpen,
        draft,
        setDraft,
        openSettings: openPrivacySettings,
        acceptAll: () => choose(ALLOW_ALL),
        rejectAll: () => choose(DENY_ALL),
        saveDraft: () => choose(draft),
    };
}
