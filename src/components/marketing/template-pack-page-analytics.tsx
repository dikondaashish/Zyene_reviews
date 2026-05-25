"use client";

import { useEffect } from "react";
import {
    TEMPLATE_PACK_PAGE_PATH,
    TEMPLATE_PACK_SOURCE,
} from "@/lib/marketing/template-pack-events";
import { trackMarketingEventClient } from "@/lib/marketing/track-marketing-event-client";

export function TemplatePackPageAnalytics() {
    useEffect(() => {
        trackMarketingEventClient("template_pack_view", {
            pagePath: TEMPLATE_PACK_PAGE_PATH,
            source: TEMPLATE_PACK_SOURCE,
            oncePerSession: true,
        });

        const section = document.getElementById("template-pack-capture");
        if (!section) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    trackMarketingEventClient("template_pack_form_view", {
                        pagePath: TEMPLATE_PACK_PAGE_PATH,
                        source: TEMPLATE_PACK_SOURCE,
                        oncePerSession: true,
                    });
                    observer.disconnect();
                }
            },
            { threshold: 0.25 }
        );
        observer.observe(section);

        const onClick = (e: MouseEvent) => {
            const anchor = (e.target as HTMLElement).closest("a[href]");
            if (!anchor) return;
            const href = anchor.getAttribute("href") ?? "";
            if (href === "/signup" || href.startsWith("/signup?")) {
                trackMarketingEventClient("template_pack_signup_click", {
                    pagePath: TEMPLATE_PACK_PAGE_PATH,
                    source: TEMPLATE_PACK_SOURCE,
                });
            } else if (href === "/pricing" || href.startsWith("/pricing?")) {
                trackMarketingEventClient("template_pack_pricing_click", {
                    pagePath: TEMPLATE_PACK_PAGE_PATH,
                    source: TEMPLATE_PACK_SOURCE,
                });
            }
        };

        document.addEventListener("click", onClick);
        return () => {
            observer.disconnect();
            document.removeEventListener("click", onClick);
        };
    }, []);

    return null;
}
