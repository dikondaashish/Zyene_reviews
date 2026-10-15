"use client";

import { CookieBannerBar } from "./cookie-banner-bar";
import { PrivacyScripts } from "./privacy-scripts";
import { PrivacySettingsDialog } from "./privacy-settings-dialog";
import { usePrivacyManager } from "./use-privacy-manager";
import { VercelMeasurement } from "./vercel-measurement";

/**
 * PrivacyManager UI root. Mounted once in the root layout, so it survives
 * client-side navigation without remounting or re-reading geolocation.
 * "Privacy choices" links reopen the dialog via `openPrivacySettings()`.
 */
export function PrivacyManager() {
    const m = usePrivacyManager();

    return (
        <>
            {m.showBanner && <CookieBannerBar onCustomize={m.openSettings} onReject={m.rejectAll} onAccept={m.acceptAll} />}
            <PrivacySettingsDialog
                open={m.settingsOpen}
                onOpenChange={m.setSettingsOpen}
                onCloseAutoFocus={m.restoreFocus}
                draft={m.draft}
                onDraftChange={m.setDraft}
                jurisdiction={m.privacy.jurisdiction}
                gpc={m.privacy.gpc}
                onReject={m.rejectAll}
                onAccept={m.acceptAll}
                onSave={m.saveDraft}
            />
            <PrivacyScripts />
            <VercelMeasurement />
        </>
    );
}
