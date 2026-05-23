"use client";

import { Button } from "@/components/ui/button";
import type { CookiePreferences } from "./cookie-banner-types";

export function CookieBannerPreferencesModal({
    preferences,
    onPreferencesChange,
    onDecline,
    onAcceptAll,
    onSaveCustom,
}: {
    preferences: CookiePreferences;
    onPreferencesChange: (updater: (prev: CookiePreferences) => CookiePreferences) => void;
    onDecline: () => void;
    onAcceptAll: () => void;
    onSaveCustom: () => void;
}) {
    return (
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
                            <p className="text-xs text-muted-foreground">
                                Required for login, security, and core app functionality.
                            </p>
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground">Always active</span>
                    </div>

                    <label className="flex items-center justify-between rounded-lg border border-border p-3 cursor-pointer">
                        <div>
                            <p className="font-medium text-foreground">Analytics/performance cookies</p>
                            <p className="text-xs text-muted-foreground">
                                Help us measure usage and improve product quality.
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            className="accent-primary size-4"
                            checked={preferences.analytics}
                            onChange={(e) =>
                                onPreferencesChange((prev) => ({
                                    ...prev,
                                    analytics: e.target.checked,
                                }))
                            }
                        />
                    </label>

                    <label className="flex items-center justify-between rounded-lg border border-border p-3 cursor-pointer">
                        <div>
                            <p className="font-medium text-foreground">Marketing cookies</p>
                            <p className="text-xs text-muted-foreground">
                                Used to personalize communications and campaign attribution.
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            className="accent-primary size-4"
                            checked={preferences.marketing}
                            onChange={(e) =>
                                onPreferencesChange((prev) => ({
                                    ...prev,
                                    marketing: e.target.checked,
                                }))
                            }
                        />
                    </label>
                </div>

                <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
                    <Button variant="outline" onClick={onDecline}>
                        Reject all
                    </Button>
                    <Button variant="outline" onClick={onAcceptAll}>
                        Allow all cookies
                    </Button>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={onSaveCustom}>
                        Confirm my choices
                    </Button>
                </div>
            </div>
        </div>
    );
}
