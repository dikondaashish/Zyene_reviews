"use server";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { canManageCompetitorWatchSettings } from "@/lib/competitors/watch-access";

const schema = z.object({
    businessId: z.string().uuid(),
    ratingAlertDelta: z.coerce.number().min(0.05).max(2),
    reviewSpikeThreshold: z.coerce.number().int().min(1).max(5000),
    emailAlertsEnabled: z.boolean(),
});

export async function updateCompetitorWatchSettings(input: z.infer<typeof schema>): Promise<{
    success: boolean;
    error?: string;
}> {
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const { businessId, ratingAlertDelta, reviewSpikeThreshold, emailAlertsEnabled } = parsed.data;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not signed in." };
    }

    const { data: member, error: memberError } = await supabase
        .from("business_members")
        .select("role")
        .eq("business_id", businessId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (memberError || !member) {
        return { success: false, error: "You do not have access to this business." };
    }

    if (!canManageCompetitorWatchSettings(member.role)) {
        return { success: false, error: "Only owners and admins can change competitor alert settings." };
    }

    const { error } = await supabase.from("competitor_watch_settings").upsert(
        {
            business_id: businessId,
            rating_alert_delta: ratingAlertDelta,
            review_spike_threshold: reviewSpikeThreshold,
            email_alerts_enabled: emailAlertsEnabled,
            updated_at: new Date().toISOString(),
        },
        { onConflict: "business_id" }
    );

    if (error) {
        logger.error({ err: error }, "[updateCompetitorWatchSettings]");
        return { success: false, error: "Could not save settings." };
    }

    revalidatePath("/settings/competitor-alerts");
    revalidatePath("/competitors");
    return { success: true };
}
