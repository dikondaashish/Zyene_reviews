"use client";

import { CookieBannerBar } from "./cookie-banner-bar";
import { CookiePreferencesDialog } from "./cookie-preferences-dialog";
import { useCookieBanner } from "./use-cookie-banner";

/** Mounted once in the root layout; "Manage cookies" links reopen the dialog via `openCookiePreferences()`. */
export function CookieBanner() {
    const c = useCookieBanner();

    return (
        <>
            {c.showBar && <CookieBannerBar onManage={c.openPreferences} onReject={c.rejectAll} onAccept={c.acceptAll} />}
            <CookiePreferencesDialog
                open={c.showPreferences}
                onOpenChange={c.setShowPreferences}
                preferences={c.draft}
                onPreferencesChange={c.setDraft}
                gpc={c.gpc}
                onReject={c.rejectAll}
                onAccept={c.acceptAll}
                onSave={c.saveDraft}
            />
        </>
    );
}
