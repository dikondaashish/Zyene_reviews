import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";

const ORG_WIDE_ROLES = ["owner", "admin", "manager", "ORG_OWNER", "ORG_ADMIN", "ORG_MANAGER"];
const BUSINESS_ROLES = ["owner", "admin", "manager", "member", "viewer"];

/**
 * Same rules as `userCanAccessBusiness` (read access), but a query error
 * THROWS instead of reading as "no access". Use it where "no access" causes a
 * durable decision (e.g. skipping a recipient whose alerts are then marked
 * delivered), so a transient DB failure retries instead of dropping the send.
 */
export async function userCanAccessBusinessOrThrow(
    supabase: SupabaseClient<Database>, userId: string, businessId: string,
): Promise<boolean> {
    const { data: business, error } = await supabase.from("businesses")
        .select("id, organization_id").eq("id", businessId).maybeSingle();
    if (error) throw new Error(`Business access check failed: ${error.message}`);
    if (business?.id !== businessId) return false;
    const { data: orgMember, error: orgError } = await supabase.from("organization_members")
        .select("role").eq("organization_id", business.organization_id)
        .eq("user_id", userId).eq("status", "active").maybeSingle();
    if (orgError) throw new Error(`Business access check failed: ${orgError.message}`);
    if (!orgMember) return false;
    if (ORG_WIDE_ROLES.includes(orgMember.role)) return true;
    const { data: member, error: memberError } = await supabase.from("business_members")
        .select("role").eq("business_id", businessId).eq("user_id", userId)
        .eq("status", "active").maybeSingle();
    if (memberError) throw new Error(`Business access check failed: ${memberError.message}`);
    return BUSINESS_ROLES.includes(member?.role ?? "");
}
