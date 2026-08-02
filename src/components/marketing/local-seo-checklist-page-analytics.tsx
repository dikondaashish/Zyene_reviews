"use client";

import { useEffect } from "react";
import {
    LOCAL_SEO_CHECKLIST_PAGE_PATH,
    LOCAL_SEO_CHECKLIST_SOURCE,
} from "@/lib/marketing/local-seo-checklist-events";
import { trackMarketingEventClient } from "@/lib/marketing/track-marketing-event-client";

export function LocalSeoChecklistPageAnalytics() {
    useEffect(() => {
        trackMarketingEventClient("local_seo_checklist_view", {
            pagePath: LOCAL_SEO_CHECKLIST_PAGE_PATH,
            source: LOCAL_SEO_CHECKLIST_SOURCE,
            oncePerSession: true,
        });

        const section = document.getElementById("resource-lead-capture");
        if (!section) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    trackMarketingEventClient("local_seo_checklist_form_view", {
                        pagePath: LOCAL_SEO_CHECKLIST_PAGE_PATH,
                        source: LOCAL_SEO_CHECKLIST_SOURCE,
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
            const path = new URL(href, window.location.origin).pathname;
            if (path === "/signup") {
                trackMarketingEventClient("local_seo_checklist_signup_click", {
                    pagePath: LOCAL_SEO_CHECKLIST_PAGE_PATH,
                    source: LOCAL_SEO_CHECKLIST_SOURCE,
                });
            } else if (path === "/pricing") {
                trackMarketingEventClient("local_seo_checklist_pricing_click", {
                    pagePath: LOCAL_SEO_CHECKLIST_PAGE_PATH,
                    source: LOCAL_SEO_CHECKLIST_SOURCE,
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
