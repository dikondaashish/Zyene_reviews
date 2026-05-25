import { createAdminClient } from "@/lib/db/supabase/admin";
import {
    isTemplatePackEventName,
    TEMPLATE_PACK_EVENT_NAMES,
    TEMPLATE_PACK_PAGE_PATH,
    TEMPLATE_PACK_SOURCE,
    type TemplatePackEventName,
} from "./template-pack-events";
import { isTemplatePackQaSubscriber } from "./template-pack-qa-filters";

export type TemplatePackLeadReport = {
    periodDays: number;
    since: string;
    /** Production metrics exclude internal QA UTM/email patterns. */
    excludesQaTraffic: boolean;
    counts: Record<TemplatePackEventName, number>;
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

function countByName(rows: Array<{ event_name: string }>): Record<TemplatePackEventName, number> {
    const counts = Object.fromEntries(
        TEMPLATE_PACK_EVENT_NAMES.map((n) => [n, 0])
    ) as Record<TemplatePackEventName, number>;
    for (const row of rows) {
        if (isTemplatePackEventName(row.event_name)) {
            counts[row.event_name] += 1;
        }
    }
    return counts;
}

export async function fetchTemplatePackLeadReport(periodDays = 30): Promise<TemplatePackLeadReport> {
    const days = Math.min(90, Math.max(1, periodDays));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const admin = createAdminClient();

    const [eventsRes, subscribersRes] = await Promise.all([
        admin
            .from("marketing_events")
            .select("event_name, utm_source, utm_medium")
            .eq("page_path", TEMPLATE_PACK_PAGE_PATH)
            .gte("created_at", since),
        admin
            .from("marketing_subscribers")
            .select("email, source, utm_source, utm_medium, utm_campaign, subscribed_at")
            .eq("source", TEMPLATE_PACK_SOURCE)
            .gte("subscribed_at", since)
            .order("subscribed_at", { ascending: false })
            .limit(50),
    ]);

    const eventRows = (eventsRes.data ?? []).filter((row) => !isQaEventRow(row));
    const latestSubmissions = (subscribersRes.data ?? [])
        .filter((row) => !isTemplatePackQaSubscriber(row.email, row.utm_source, row.utm_medium))
        .slice(0, 20);

    const counts = countByName(eventRows);
    const pageViews = counts.template_pack_view;
    const subscribeSuccesses = counts.template_pack_subscribe_success;

    return {
        periodDays: days,
        since,
        excludesQaTraffic: true,
        counts,
        pageViews,
        submissions: counts.template_pack_submit,
        subscribeSuccesses,
        conversionRatePercent:
            pageViews > 0 ? Math.round((subscribeSuccesses / pageViews) * 1000) / 10 : null,
        signupClicks: counts.template_pack_signup_click,
        pricingClicks: counts.template_pack_pricing_click,
        latestSubmissions,
    };
}
