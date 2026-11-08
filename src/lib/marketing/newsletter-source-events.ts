import { recordMarketingEvent } from "@/lib/marketing/record-marketing-event";
import {
    LOCAL_SEO_CHECKLIST_PAGE_PATH,
    LOCAL_SEO_CHECKLIST_SOURCE,
} from "@/lib/marketing/local-seo-checklist-events";
import { TEMPLATE_PACK_PAGE_PATH, TEMPLATE_PACK_SOURCE } from "@/lib/marketing/template-pack-events";

type Utm = { utm_source?: string | null; utm_medium?: string | null; utm_campaign?: string | null };
type Stage = "submit" | "subscribe_success";

const LEAD_MAGNETS = {
    [TEMPLATE_PACK_SOURCE]: { prefix: "template_pack", pagePath: TEMPLATE_PACK_PAGE_PATH },
    [LOCAL_SEO_CHECKLIST_SOURCE]: { prefix: "local_seo_checklist", pagePath: LOCAL_SEO_CHECKLIST_PAGE_PATH },
} as const;

/**
 * Funnel events for the lead-magnet forms. `submit` fires when the form is sent;
 * `subscribe_success` fires only once the address owner confirms.
 */
export async function recordNewsletterSourceEvent(source: string, stage: Stage, utm: Utm): Promise<void> {
    const magnet = LEAD_MAGNETS[source as keyof typeof LEAD_MAGNETS];
    if (!magnet) return;
    await recordMarketingEvent({
        eventName: `${magnet.prefix}_${stage}` as Parameters<typeof recordMarketingEvent>[0]["eventName"],
        pagePath: magnet.pagePath,
        source,
        utmSource: utm.utm_source ?? null,
        utmMedium: utm.utm_medium ?? null,
        utmCampaign: utm.utm_campaign ?? null,
    });
}
