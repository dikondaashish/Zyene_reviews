"use client";

import { useEffect } from "react";
import Script from "next/script";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { googleConsentModeState } from "@/lib/privacy/consent-policy";
import { usePrivacy } from "@/lib/privacy/privacy-store";
import { BETTERSTACK_ANNOUNCEMENT_ID, GTM_ID } from "@/lib/privacy/tracking-config";
import { enableSentryReplay } from "@/lib/monitoring/sentry-replay-consent";

/** Pushes `data-track` CTA clicks to the dataLayer for GTM conversion tags. */
const CTA_TRACKER = `document.addEventListener('click',function(e){var el=e.target.closest('[data-track]');if(!el)return;window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:el.getAttribute('data-track')+'_click',cta_location:el.getAttribute('data-track-location')||'',cta_text:(el.innerText||'').trim().slice(0,60),cta_url:el.getAttribute('href')||''});});`;

function gtmBootstrap(consentState: ReturnType<typeof googleConsentModeState>): string {
    // Consent Mode default must be queued before gtm.js so tags inside the container honour the split.
    return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',${JSON.stringify(consentState)});
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`;
}

/**
 * Script controller: the only place non-essential third-party browser code is
 * started. Nothing renders on the server or before the PrivacyManager grants a
 * category, so in opt-in regions the first page view makes no request to these
 * hosts. Withdrawal reloads the page (see `savePrivacyChoice`).
 */
export function PrivacyScripts() {
    const { granted } = usePrivacy();
    const { functional, analytics, marketing } = granted;
    const loadGtm = analytics || marketing;

    useEffect(() => {
        if (analytics) enableSentryReplay();
    }, [analytics]);

    useEffect(() => {
        // A category granted after GTM loaded: update Consent Mode in place.
        const w = window as Window & { gtag?: (...args: unknown[]) => void };
        if (typeof w.gtag === "function") {
            w.gtag("consent", "update", googleConsentModeState({ functional, analytics, marketing }));
        }
    }, [functional, analytics, marketing]);

    return (
        <>
            {loadGtm && (
                <>
                    <Script id="gtm-head" strategy="afterInteractive">
                        {gtmBootstrap(googleConsentModeState(granted))}
                    </Script>
                    <Script id="cta-click-tracker" strategy="afterInteractive">
                        {CTA_TRACKER}
                    </Script>
                </>
            )}
            {marketing && <MetaPixel />}
            {functional && (
                <Script
                    src="https://uptime.betterstack.com/widgets/announcement.js"
                    data-id={BETTERSTACK_ANNOUNCEMENT_ID}
                    strategy="lazyOnload"
                />
            )}
        </>
    );
}
