import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { z } from "zod";
import { recordMarketingEvent } from "@/lib/marketing/record-marketing-event";
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

    if (!isTemplatePackEventName(event_name)) {
        return NextResponse.json({ error: "Unknown event" }, { status: 400 });
    }

    if (page_path && page_path !== TEMPLATE_PACK_PAGE_PATH) {
        return NextResponse.json({ error: "Invalid page path" }, { status: 400 });
    }

    try {
        await recordMarketingEvent({
            eventName: event_name,
            pagePath: page_path ?? TEMPLATE_PACK_PAGE_PATH,
            source: source ?? TEMPLATE_PACK_SOURCE,
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
