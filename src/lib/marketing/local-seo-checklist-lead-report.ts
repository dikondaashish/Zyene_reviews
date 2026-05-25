import { createAdminClient } from "@/lib/db/supabase/admin";
import {
    isLocalSeoChecklistEventName,
    LOCAL_SEO_CHECKLIST_EVENT_NAMES,
    LOCAL_SEO_CHECKLIST_PAGE_PATH,
    LOCAL_SEO_CHECKLIST_SOURCE,
    type LocalSeoChecklistEventName,
} from "./local-seo-checklist-events";
import { isTemplatePackQaSubscriber } from "./template-pack-qa-filters";

export type LocalSeoChecklistLeadReport = {
    periodDays: number;
    since: string;
    excludesQaTraffic: boolean;
    counts: Record<LocalSeoChecklistEventName, number>;
    pageViews: number;
    submissions: number;
    subscribeSuccesses: number;
    conversionRatePercent: number | null;
    signupClicks: number;
    pricingClicks: number;
    latestSubmissions: Array<{
        email: string;
        source: string;
        utm_source: string | null;
        utm_medium: string | null;
        utm_campaign: string | null;
        subscribed_at: string;
    }>;
};

function isQaEventRow(row: { utm_source: string | null; utm_medium: string | null }): boolean {
    return isTemplatePackQaSubscriber("", row.utm_source, row.utm_medium);
}

function countByName(rows: Array<{ event_name: string }>): Record<LocalSeoChecklistEventName, number> {
    const counts = Object.fromEntries(
        LOCAL_SEO_CHECKLIST_EVENT_NAMES.map((n) => [n, 0])
    ) as Record<LocalSeoChecklistEventName, number>;
    for (const row of rows) {
        if (isLocalSeoChecklistEventName(row.event_name)) {
            counts[row.event_name] += 1;
        }
    }
    return counts;
}

export async function fetchLocalSeoChecklistLeadReport(
    periodDays = 30
): Promise<LocalSeoChecklistLeadReport> {
    const days = Math.min(90, Math.max(1, periodDays));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const admin = createAdminClient();

    const [eventsRes, subscribersRes] = await Promise.all([
        admin
            .from("marketing_events")
            .select("event_name, utm_source, utm_medium")
            .eq("page_path", LOCAL_SEO_CHECKLIST_PAGE_PATH)
            .gte("created_at", since),
        admin
            .from("marketing_subscribers")
            .select("email, source, utm_source, utm_medium, utm_campaign, subscribed_at")
            .eq("source", LOCAL_SEO_CHECKLIST_SOURCE)
            .gte("subscribed_at", since)
            .order("subscribed_at", { ascending: false })
            .limit(50),
    ]);

    const eventRows = (eventsRes.data ?? []).filter((row) => !isQaEventRow(row));
    const latestSubmissions = (subscribersRes.data ?? [])
        .filter((row) => !isTemplatePackQaSubscriber(row.email, row.utm_source, row.utm_medium))
        .slice(0, 20);

    const counts = countByName(eventRows);
    const pageViews = counts.local_seo_checklist_view;
    const subscribeSuccesses = counts.local_seo_checklist_subscribe_success;

    return {
        periodDays: days,
        since,
        excludesQaTraffic: true,
        counts,
        pageViews,
        submissions: counts.local_seo_checklist_submit,
        subscribeSuccesses,
        conversionRatePercent:
            pageViews > 0 ? Math.round((subscribeSuccesses / pageViews) * 1000) / 10 : null,
        signupClicks: counts.local_seo_checklist_signup_click,
        pricingClicks: counts.local_seo_checklist_pricing_click,
        latestSubmissions,
    };
}
