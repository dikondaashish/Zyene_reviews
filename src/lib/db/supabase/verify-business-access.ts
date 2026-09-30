import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";

/** Live business-scoped membership, with org-wide access only for org managers. */
export async function userCanAccessBusiness(
    supabase: SupabaseClient<Database>, userId: string, businessId: string,
    write = false,
): Promise<boolean> {
    const { data: business, error } = await supabase.from("businesses")
        .select("id, organization_id").eq("id", businessId).maybeSingle();
    if (error || business?.id !== businessId) return false;
    const { data: orgMember, error: orgError } = await supabase.from("organization_members")
        .select("role").eq("organization_id", business.organization_id)
        .eq("user_id", userId).eq("status", "active").maybeSingle();
    if (orgError || !orgMember) return false;
    if (["owner", "admin", "manager", "ORG_OWNER", "ORG_ADMIN", "ORG_MANAGER"].includes(orgMember.role)) return true;
    const { data: member, error: memberError } = await supabase.from("business_members")
        .select("role").eq("business_id", businessId).eq("user_id", userId)
        .eq("status", "active").maybeSingle();
    return !memberError && ["owner", "admin", "manager", "member", "viewer"].includes(member?.role ?? "") &&
        (!write || member?.role !== "viewer");
}
