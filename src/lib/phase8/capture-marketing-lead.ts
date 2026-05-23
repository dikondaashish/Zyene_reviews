import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function captureMarketingLead(params: {
    email: string;
    source: string;
    metadata?: Record<string, string>;
}): Promise<{ ok: true } | { ok: false; error: string }> {
    const email = params.email.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
        return { ok: false, error: "Valid work email is required" };
    }

    const admin = createAdminClient();
    const { error } = await admin.from("marketing_subscribers").upsert(
        {
            email,
            source: params.source,
            utm_source: "enterprise",
            utm_medium: params.source,
            utm_campaign: "phase8",
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null,
        },
        { onConflict: "email" }
    );

    if (error) {
        logger.error({ err: error }, "[capture-marketing-lead]");
        return { ok: false, error: "Could not save your request" };
    }

    return { ok: true };
}
