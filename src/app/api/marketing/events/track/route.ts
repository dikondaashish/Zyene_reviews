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
import { EXIT_INTENT_SOURCE, isExitIntentEventName } from "@/lib/marketing/exit-intent-events";
import { isLeadWizardEventName, LEAD_WIZARD_SOURCE } from "@/lib/marketing/lead-wizard-events";

/** Allowlisted event families. `fixedPath` families only fire from one page; the rest from any marketing path. */
const EVENT_FAMILIES = [
    { matches: isTemplatePackEventName, defaultPath: TEMPLATE_PACK_PAGE_PATH, defaultSource: TEMPLATE_PACK_SOURCE, fixedPath: true },
    { matches: isLocalSeoChecklistEventName, defaultPath: LOCAL_SEO_CHECKLIST_PAGE_PATH, defaultSource: LOCAL_SEO_CHECKLIST_SOURCE, fixedPath: true },
    { matches: isExitIntentEventName, defaultPath: "/", defaultSource: EXIT_INTENT_SOURCE, fixedPath: false },
    { matches: isLeadWizardEventName, defaultPath: "/", defaultSource: LEAD_WIZARD_SOURCE, fixedPath: false },
] as const;

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

    const family = EVENT_FAMILIES.find((candidate) => candidate.matches(event_name));
    if (!family) {
        return NextResponse.json({ error: "Unknown event" }, { status: 400 });
    }
    if (page_path && (family.fixedPath ? page_path !== family.defaultPath : !page_path.startsWith("/"))) {
        return NextResponse.json({ error: "Invalid page path" }, { status: 400 });
    }
    const resolvedPagePath = page_path ?? family.defaultPath;
    const resolvedSource = source ?? family.defaultSource;

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
