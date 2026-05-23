import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function verifyCampaignOwnership(
    supabase: SupabaseClient,
    userId: string,
    campaignId: string
) {
    const { data: campaignById } = await supabase
        .from("campaigns")
        .select("id, business_id")
        .eq("id", campaignId)
        .maybeSingle();
    if (!campaignById?.business_id) return null;

    const allowed = await userCanAccessBusiness(supabase, userId, campaignById.business_id);
    if (!allowed) return null;

    const { data: campaign } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .eq("business_id", campaignById.business_id)
        .single();

    return campaign;
}
