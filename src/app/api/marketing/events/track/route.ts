import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { z } from "zod";
import { recordMarketingEvent } from "@/lib/marketing/record-marketing-event";
import {
    isLocalSeoChecklistEventName,
    LOCAL_SEO_CHECKLIST_PAGE_PATH,
    LOCAL_SEO_CHECKLIST_SOURCE,
} from "@/lib/marketing/local-seo-checklist-events";
import {
    isTemplatePackEventName,
    TEMPLATE_PACK_PAGE_PATH,
    TEMPLATE_PACK_SOURCE,
} from "@/lib/marketing/template-pack-events";

const trackSchema = z.object({
    event_name: z.string().min(1).max(80),
    page_path: z.string().max(200).optional(),
    source: z.string().max(80).optional(),
    utm_source: z.string().max(120).optional(),
    utm_medium: z.string().max(120).optional(),
    utm_campaign: z.string().max(120).optional(),
    metadata: z.record(z.string(), z.string()).optional(),
});

export async function POST(request: Request) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = trackSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { event_name, page_path, source, utm_source, utm_medium, utm_campaign, metadata } = parsed.data;

    const isTemplatePack = isTemplatePackEventName(event_name);
    const isLocalSeo = isLocalSeoChecklistEventName(event_name);

    if (!isTemplatePack && !isLocalSeo) {
        return NextResponse.json({ error: "Unknown event" }, { status: 400 });
    }

    if (isTemplatePack && page_path && page_path !== TEMPLATE_PACK_PAGE_PATH) {
        return NextResponse.json({ error: "Invalid page path" }, { status: 400 });
    }

    if (isLocalSeo && page_path && page_path !== LOCAL_SEO_CHECKLIST_PAGE_PATH) {
        return NextResponse.json({ error: "Invalid page path" }, { status: 400 });
    }

    const resolvedPagePath = isLocalSeo
        ? (page_path ?? LOCAL_SEO_CHECKLIST_PAGE_PATH)
        : (page_path ?? TEMPLATE_PACK_PAGE_PATH);
    const resolvedSource = isLocalSeo
        ? (source ?? LOCAL_SEO_CHECKLIST_SOURCE)
        : (source ?? TEMPLATE_PACK_SOURCE);

    try {
        await recordMarketingEvent({
            eventName: event_name,
            pagePath: resolvedPagePath,
            source: resolvedSource,
            utmSource: utm_source ?? null,
            utmMedium: utm_medium ?? null,
            utmCampaign: utm_campaign ?? null,
            metadata: metadata ?? {},
        });
    } catch (err) {
        logger.error({ err }, "[marketing/events/track]");
        return NextResponse.json({ error: "Could not record event" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
