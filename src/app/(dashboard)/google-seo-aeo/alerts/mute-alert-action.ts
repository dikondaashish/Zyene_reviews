"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/supabase/server";

/**
 * Calls mute_aeo_alert(uuid) — a narrow SECURITY DEFINER RPC, not a direct
 * table UPDATE. There is no client-writable UPDATE policy on aeo_alerts;
 * this RPC is the only write surface a signed-in user has, and it can only
 * ever set muted_at on a row already scoped to the caller's own org.
 */
export async function muteAeoAlert(alertId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase.rpc("mute_aeo_alert", { p_alert_id: alertId });
    if (error) return { success: false, error: error.message };

    revalidatePath("/google-seo-aeo/alerts");
    return { success: true };
}
