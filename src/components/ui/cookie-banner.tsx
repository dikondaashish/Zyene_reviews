"use client";

import { CookieBannerBar } from "./cookie-banner-bar";
import { CookieBannerPreferencesModal } from "./cookie-banner-preferences-modal";
import { useCookieBanner } from "./use-cookie-banner";

export function CookieBanner() {
    const c = useCookieBanner();

    if (!c.isVisible && !c.showPreferences) return null;

    return (
        <>
            {c.isVisible && (
                <CookieBannerBar
                    onManage={() => {
                        c.setIsVisible(false);
                        c.setShowPreferences(true);
                    }}
                    onDecline={c.declineCookies}
                    onAccept={c.acceptCookies}
                />
            )}

            {c.showPreferences && (
                <CookieBannerPreferencesModal
                    preferences={c.preferences}
                    onPreferencesChange={c.setPreferences}
                    onDecline={c.declineCookies}
                    onAcceptAll={c.acceptCookies}
                    onSaveCustom={c.saveCustomPreferences}
                />
            )}
        </>
    );
}
