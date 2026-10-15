"use client";

import { deserializeUtm, UTM_COOKIE_NAME } from "@/lib/growth/utm";
import { hasConsent } from "@/lib/privacy/privacy-store";

function readUtmCookie() {
    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${UTM_COOKIE_NAME}=`));
    if (!match) return {};
    const parsed = deserializeUtm(decodeURIComponent(match.split("=").slice(1).join("=")));
    return {
        utm_source: parsed?.utm_source,
        utm_medium: parsed?.utm_medium,
        utm_campaign: parsed?.utm_campaign,
    };
}

export function trackMarketingEventClient(
    eventName: string,
    opts: {
        pagePath: string;
        source: string;
        oncePerSession?: boolean;
        metadata?: Record<string, string>;
    }
): void {
    // First-party usage analytics (plus a sessionStorage dedupe flag): opt-in like any other analytics.
    if (!hasConsent("analytics")) return;
    if (opts.oncePerSession) {
        const key = `zyene_me_${eventName}`;
        try {
            if (sessionStorage.getItem(key)) return;
            sessionStorage.setItem(key, "1");
        } catch {
            /* private browsing */
        }
    }

    void fetch("/api/marketing/events/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
            event_name: eventName,
            page_path: opts.pagePath,
            source: opts.source,
            ...readUtmCookie(),
            metadata: opts.metadata,
        }),
    }).catch(() => {
        /* non-blocking */
    });
}
