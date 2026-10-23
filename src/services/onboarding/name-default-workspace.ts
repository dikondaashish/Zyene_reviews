import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

/** Signup names the workspace "<Name>'s Org" and the business "<Name>'s Business" until the owner says otherwise. */
const DEFAULT_ORG_SUFFIX = "'s Org";
const DEFAULT_BUSINESS_SUFFIX = "'s Business";

export function shouldRenameWorkspace(orgName: string | null | undefined, businessName: string | null | undefined): boolean {
    const org = orgName?.trim() ?? "";
    const business = businessName?.trim() ?? "";
    return org.endsWith(DEFAULT_ORG_SUFFIX) && business.length > 0 && !business.endsWith(DEFAULT_BUSINESS_SUFFIX);
}

/**
 * Onboarding no longer asks owners to name a workspace. Once the real business is known, a
 * workspace still on its signup default takes the business name. A name the owner chose is never
 * touched. Best effort: a failure only leaves the default name in place.
 */
export async function nameDefaultWorkspaceAfterBusiness(supabase: SupabaseClient, businessId: string): Promise<void> {
    try {
        const { data: business } = await supabase
            .from("businesses")
            .select("name, organization_id, organizations(name)")
            .eq("id", businessId)
            .maybeSingle();
        const org = (Array.isArray(business?.organizations) ? business?.organizations[0] : business?.organizations) as
            | { name?: string | null }
            | null
            | undefined;
        if (!business?.organization_id || !shouldRenameWorkspace(org?.name, business.name)) return;

        const { error } = await supabase
            .from("organizations")
            .update({ name: business.name.trim(), updated_at: new Date().toISOString() })
            .eq("id", business.organization_id);
        if (error) logger.warn({ err: error, businessId }, "[onboarding] could not name workspace after business");
    } catch (err) {
        logger.warn({ err, businessId }, "[onboarding] naming workspace failed");
    }
}
