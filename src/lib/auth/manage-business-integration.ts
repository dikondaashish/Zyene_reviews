import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";

const MANAGER_ROLES = [
    "owner", "admin", "manager", "ORG_OWNER", "ORG_ADMIN", "ORG_MANAGER",
];

export async function canManageBusinessIntegration(
    supabase: SupabaseClient<Database>,
    userId: string,
    businessId: string,
): Promise<boolean> {
    const { data: business, error: businessError } = await supabase
        .from("businesses")
        .select("id, organization_id")
        .eq("id", businessId)
        .maybeSingle();
    if (businessError || business?.id !== businessId) return false;

    const [{ data: businessMember, error: businessMemberError }, { data: orgMember, error: orgMemberError }] =
        await Promise.all([
            supabase.from("business_members").select("role")
                .eq("business_id", businessId).eq("user_id", userId)
                .eq("status", "active").maybeSingle(),
            supabase.from("organization_members").select("role")
                .eq("organization_id", business.organization_id).eq("user_id", userId)
                .eq("status", "active").maybeSingle(),
        ]);

    if (businessMemberError || orgMemberError || !orgMember) return false;
    return MANAGER_ROLES.includes(businessMember?.role ?? "") ||
        MANAGER_ROLES.includes(orgMember?.role ?? "");
}
