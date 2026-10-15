import Script from "next/script";

import { META_PIXEL_ID } from "@/lib/privacy/tracking-config";

/**
 * Meta (Facebook) Pixel. Rendered by `PrivacyScripts` only after marketing
 * consent, and renders nothing when the id is unset.
 * There is deliberately no `noscript` beacon: without JS nobody can consent.
 */
export function MetaPixel() {
    if (!META_PIXEL_ID) return null;

    return (
        <Script id="meta-pixel" strategy="lazyOnload">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
        </Script>
    );
}
