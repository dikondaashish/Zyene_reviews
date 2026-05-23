"use client";

import { useEffect, useState } from "react";
import { isBusinessSlugPath as pathIsBusinessSlug } from "@/lib/routing/platform-routes";
import type { CookiePreferences } from "./cookie-banner-types";
import { COOKIE_CONSENT_KEY, COOKIE_PREFERENCES_KEY } from "./cookie-banner-constants";
import { safeLocalStorageGet, safeLocalStorageSet } from "@/lib/safe-storage";

export function useCookieBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);
    const [preferences, setPreferences] = useState<CookiePreferences>({
        essential: true,
        analytics: false,
        marketing: false,
    });

    useEffect(() => {
        const isEmbedWidgetPath = window.location.pathname.startsWith("/w/");
        const isPublicReviewPath = window.location.pathname.startsWith("/r/");
        const isBusinessSlugPath = pathIsBusinessSlug(window.location.pathname);
        const isInsideIframe = window.self !== window.top;
        if (isEmbedWidgetPath || isPublicReviewPath || isBusinessSlugPath || isInsideIframe) {
            return;
        }

        const timer = setTimeout(() => {
            const consent = safeLocalStorageGet(COOKIE_CONSENT_KEY);
            if (!consent) {
                setIsVisible(true);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const raw = safeLocalStorageGet(COOKIE_PREFERENCES_KEY);
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw) as Partial<CookiePreferences>;
            setPreferences({
                essential: true,
                analytics: Boolean(parsed.analytics),
                marketing: Boolean(parsed.marketing),
            });
        } catch {
            // Ignore malformed local state.
        }
    }, []);

    useEffect(() => {
        const openPreferences = () => {
            setIsVisible(false);
            setShowPreferences(true);
        };

        const w = window as Window & {
            openCookiePreferences?: () => void;
        };
        w.openCookiePreferences = openPreferences;
        window.addEventListener("zyene:open-cookie-preferences", openPreferences);

        return () => {
            window.removeEventListener("zyene:open-cookie-preferences", openPreferences);
            delete w.openCookiePreferences;
        };
    }, []);

    const savePreferences = (value: CookiePreferences, mode: "accepted" | "custom" | "declined") => {
        safeLocalStorageSet(COOKIE_CONSENT_KEY, mode);
        safeLocalStorageSet(COOKIE_PREFERENCES_KEY, JSON.stringify(value));
    };

    const acceptCookies = () => {
        const next = { essential: true, analytics: true, marketing: true };
        setPreferences(next);
        savePreferences(next, "accepted");
        setIsVisible(false);
        setShowPreferences(false);
    };

    const declineCookies = () => {
        const next = { essential: true, analytics: false, marketing: false };
        setPreferences(next);
        savePreferences(next, "declined");
        setIsVisible(false);
        setShowPreferences(false);
    };

    const saveCustomPreferences = () => {
        savePreferences(preferences, "custom");
        setShowPreferences(false);
    };

    return {
        isVisible,
        setIsVisible,
        showPreferences,
        setShowPreferences,
        preferences,
        setPreferences,
        acceptCookies,
        declineCookies,
        saveCustomPreferences,
    };
}
