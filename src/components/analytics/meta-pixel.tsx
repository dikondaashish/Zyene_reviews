import Script from "next/script";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "";

/**
 * Meta (Facebook) Pixel. Renders nothing at all when the id is unset, so a
 * deployment without the env var ships no tracking script and no tracking
 * pixel — the `noscript` fallback is gated on the same check as the script.
 *
 * Raw `<img>` rather than `next/image`: this is a 1x1 tracking beacon on a
 * third-party origin, not content, and it must work with JS disabled.
 */
export function MetaPixel() {
    if (!META_PIXEL_ID) return null;

    return (
        <>
            <Script id="meta-pixel" strategy="afterInteractive">
                {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
            </Script>
            <noscript>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    height="1"
                    width="1"
                    style={{ display: "none" }}
                    src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                    alt=""
                />
            </noscript>
        </>
    );
}
