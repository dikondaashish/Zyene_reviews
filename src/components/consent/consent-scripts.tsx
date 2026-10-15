"use client";

import { useEffect } from "react";
import Script from "next/script";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { googleConsentModeState } from "@/lib/consent/consent-record";
import { useConsent } from "@/lib/consent/consent-store";
import { enableSentryReplay } from "@/lib/monitoring/sentry-replay-consent";

const GTM_ID = "GTM-WF6DJZ8J";

/** Pushes `data-track` CTA clicks to the dataLayer for GTM conversion tags. */
const CTA_TRACKER = `document.addEventListener('click',function(e){var el=e.target.closest('[data-track]');if(!el)return;window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:el.getAttribute('data-track')+'_click',cta_location:el.getAttribute('data-track-location')||'',cta_text:(el.innerText||'').trim().slice(0,60),cta_url:el.getAttribute('href')||''});});`;

function gtmBootstrap(consentState: ReturnType<typeof googleConsentModeState>): string {
    // Consent Mode default must be queued before gtm.js so tags in the container honour the split.
    return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',${JSON.stringify(consentState)});
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`;
}

/**
 * Loads every non-essential browser tool only after the visitor opts in.
 * Nothing here renders before a choice, so the first page view sets no
 * analytics or advertising cookies. Withdrawal reloads the page (see `saveConsent`).
 */
export function ConsentScripts() {
    const { granted } = useConsent();
    const loadGtm = granted.analytics || granted.marketing;

    useEffect(() => {
        if (granted.analytics) enableSentryReplay();
    }, [granted.analytics]);

    const { analytics, marketing } = granted;
    useEffect(() => {
        // Granting an extra category after GTM loaded: update Consent Mode in place.
        const w = window as Window & { gtag?: (...args: unknown[]) => void };
        if (typeof w.gtag === "function") w.gtag("consent", "update", googleConsentModeState({ analytics, marketing }));
    }, [analytics, marketing]);

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
            {granted.marketing && <MetaPixel />}
        </>
    );
}
