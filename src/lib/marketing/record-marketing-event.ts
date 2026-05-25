import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import type { Json } from "@/lib/db/supabase/database.types";

export type MarketingEventInput = {
    eventName: string;
    pagePath?: string | null;
    source?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    metadata?: Record<string, unknown>;
};

export async function recordMarketingEvent(input: MarketingEventInput): Promise<void> {
    const admin = createAdminClient();
    const { error } = await admin.from("marketing_events").insert({
        event_name: input.eventName,
        page_path: input.pagePath ?? null,
        source: input.source ?? null,
        utm_source: input.utmSource ?? null,
        utm_medium: input.utmMedium ?? null,
        utm_campaign: input.utmCampaign ?? null,
        metadata: (input.metadata ?? {}) as Json,
    });

    if (error) {
        logger.error({ err: error, eventName: input.eventName }, "[marketing-events] insert failed");
    }
}
