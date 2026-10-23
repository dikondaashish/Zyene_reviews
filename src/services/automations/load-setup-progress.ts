import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { buildSetupProgress, type SetupProgress } from "@/lib/automations/setup-progress";

/** Reads only counts and flags; works with the caller's RLS client or the admin client. */
export async function loadSetupProgress(
    supabase: SupabaseClient,
    businessId: string,
    googleConnected: boolean,
): Promise<SetupProgress | null> {
    try {
        const [biz, customers, campaigns, imports] = await Promise.all([
            supabase.from("businesses").select("slug, reply_rules_enabled, auto_reply_enabled").eq("id", businessId).maybeSingle(),
            supabase.from("customers").select("id", { count: "exact", head: true }).eq("business_id", businessId),
            supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("business_id", businessId).eq("status", "active"),
            supabase.from("enrollment_imports").select("id", { count: "exact", head: true }).eq("business_id", businessId).eq("status", "active"),
        ]);
        if (biz.error) throw biz.error;
        const b = (biz.data ?? {}) as { slug?: string | null; reply_rules_enabled?: boolean; auto_reply_enabled?: boolean };
        return buildSetupProgress({
            googleConnected,
            hasReviewLink: Boolean(b.slug),
            repliesHandled: Boolean(b.reply_rules_enabled || b.auto_reply_enabled),
            customerCount: customers.count ?? 0,
            requestsRunning: (campaigns.count ?? 0) + (imports.count ?? 0) > 0,
        });
    } catch (err) {
        logger.warn({ err, businessId }, "[automations] setup progress load failed");
        return null;
    }
}
