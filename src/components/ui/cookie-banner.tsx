"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { isBusinessSlugPath as pathIsBusinessSlug } from "@/lib/routing/platform-routes";

type CookiePreferences = {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
};

const CONSENT_KEY = "cookie-consent";
const PREFERENCES_KEY = "cookie-preferences";

export function CookieBanner() {
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

        // Delay slightly so it doesn't block the initial render immediately
        const timer = setTimeout(() => {
            const consent = localStorage.getItem(CONSENT_KEY);
            if (!consent) {
                setIsVisible(true);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const raw = localStorage.getItem(PREFERENCES_KEY);
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
        localStorage.setItem(CONSENT_KEY, mode);
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(value));
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

    if (!isVisible && !showPreferences) return null;

    return (
        <>
            {isVisible && (
                <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5 duration-500">
                    <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-border rounded-xl bg-card">
                        <div className="flex items-start sm:items-center gap-4">
                            <div className="hidden sm:flex p-2 bg-primary/10 rounded-full border border-primary/20">
                                <Cookie className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">We value your privacy</p>
                                <p className="text-xs text-muted-foreground mt-1 max-w-[500px]">
                                    We use cookies to improve security, performance, and product analytics.
                                    You can accept all cookies or customize your choices.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0 self-end sm:self-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground hover:bg-muted"
                                onClick={() => {
                                    setIsVisible(false);
                                    setShowPreferences(true);
                                }}
                            >
                                Manage
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground hover:bg-muted"
                                onClick={declineCookies}
                            >
                                Decline
                            </Button>
                            <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                onClick={acceptCookies}
                            >
                                Accept All
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {showPreferences && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4">
                    <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-2xl">
                        <div className="border-b border-border px-5 py-4">
                            <h2 className="text-xl font-semibold text-foreground">Cookie settings</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Choose which cookies to allow. Essential cookies are always active.
                            </p>
                        </div>

                        <div className="space-y-4 px-5 py-4">
                            <div className="flex items-center justify-between rounded-lg border border-border p-3">
                                <div>
                                    <p className="font-medium text-foreground">Essential cookies</p>
                                    <p className="text-xs text-muted-foreground">Required for login, security, and core app functionality.</p>
                                </div>
                                <span className="text-xs font-semibold text-muted-foreground">Always active</span>
                            </div>

                            <label className="flex items-center justify-between rounded-lg border border-border p-3 cursor-pointer">
                                <div>
                                    <p className="font-medium text-foreground">Analytics/performance cookies</p>
                                    <p className="text-xs text-muted-foreground">Help us measure usage and improve product quality.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 accent-primary"
                                    checked={preferences.analytics}
                                    onChange={(e) =>
                                        setPreferences((prev) => ({
                                            ...prev,
                                            analytics: e.target.checked,
                                        }))
                                    }
                                />
                            </label>

                            <label className="flex items-center justify-between rounded-lg border border-border p-3 cursor-pointer">
                                <div>
                                    <p className="font-medium text-foreground">Marketing cookies</p>
                                    <p className="text-xs text-muted-foreground">Used to personalize communications and campaign attribution.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 accent-primary"
                                    checked={preferences.marketing}
                                    onChange={(e) =>
                                        setPreferences((prev) => ({
                                            ...prev,
                                            marketing: e.target.checked,
                                        }))
                                    }
                                />
                            </label>
                        </div>

                        <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
                            <Button variant="outline" onClick={declineCookies}>
                                Reject all
                            </Button>
                            <Button variant="outline" onClick={acceptCookies}>
                                Allow all cookies
                            </Button>
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={saveCustomPreferences}>
                                Confirm my choices
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
