"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { ConsentPreferences } from "@/lib/consent/consent-record";

const CATEGORIES: { key: keyof ConsentPreferences; title: string; body: string }[] = [
    {
        key: "analytics",
        title: "Analytics",
        body: "Google Analytics (via Google Tag Manager) and Sentry session replay, so we can see which pages work and fix errors faster.",
    },
    {
        key: "marketing",
        title: "Marketing",
        body: "Meta Pixel, Google Ads conversion tags and our campaign-attribution cookie, so we can measure which ads bring sign-ups.",
    },
];

export function CookiePreferencesDialog({
    open,
    onOpenChange,
    preferences,
    onPreferencesChange,
    gpc,
    onReject,
    onAccept,
    onSave,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    preferences: ConsentPreferences;
    onPreferencesChange: (next: ConsentPreferences) => void;
    gpc: boolean;
    onReject: () => void;
    onAccept: () => void;
    onSave: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Cookie settings</DialogTitle>
                    <DialogDescription>
                        Your choice is saved for six months across www, auth and app.zyenereviews.com. You can change
                        it any time from &ldquo;Manage cookies&rdquo; in the footer.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
                        <div>
                            <p className="font-medium text-foreground">Strictly necessary</p>
                            <p className="text-xs text-muted-foreground">
                                Sign-in session, security, payments, language and theme, and this choice itself.
                            </p>
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-muted-foreground">Always on</span>
                    </div>

                    {CATEGORIES.map(({ key, title, body }) => {
                        const blockedByGpc = key === "marketing" && gpc;
                        return (
                            <label
                                key={key}
                                className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-border p-3"
                            >
                                <div>
                                    <p className="font-medium text-foreground">{title}</p>
                                    <p className="text-xs text-muted-foreground">{body}</p>
                                    {blockedByGpc && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Off because your browser sends a Global Privacy Control signal.
                                        </p>
                                    )}
                                </div>
                                <input
                                    type="checkbox"
                                    className="size-4 shrink-0 accent-primary"
                                    checked={preferences[key] && !blockedByGpc}
                                    disabled={blockedByGpc}
                                    onChange={(e) => onPreferencesChange({ ...preferences, [key]: e.target.checked })}
                                />
                            </label>
                        );
                    })}
                </div>

                <DialogFooter className="gap-2 sm:justify-between">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onReject}>
                            Reject all
                        </Button>
                        <Button variant="outline" onClick={onAccept}>
                            Accept all
                        </Button>
                    </div>
                    <Button onClick={onSave}>Save my choices</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
