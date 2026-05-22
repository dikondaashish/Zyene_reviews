import { createAdminClient } from "@/lib/db/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function captureToolLead(params: {
    email: string;
    source: string;
    metadata?: Record<string, string>;
}): Promise<{ ok: true } | { ok: false; error: string }> {
    const email = params.email.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
        return { ok: false, error: "Valid email is required" };
    }

    const admin = createAdminClient();
    const { error } = await admin.from("marketing_subscribers").upsert(
        {
            email,
            source: params.source,
            utm_source: "free_tool",
            utm_medium: params.source,
            utm_campaign: "phase7_tools",
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null,
        },
        { onConflict: "email" }
    );

    if (error) {
        console.error("[capture-tool-lead]", error);
        return { ok: false, error: "Could not save your email" };
    }

    return { ok: true };
}
