import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";

const ADD_BUSINESS_ROLES = [
    "owner", "admin", "manager", "ORG_OWNER", "ORG_ADMIN", "ORG_MANAGER",
];

export async function canAddBusinessToOrganization(
    supabase: SupabaseClient<Database>,
    userId: string,
    organizationId: string,
): Promise<boolean> {
    const { data, error } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", userId)
        .eq("organization_id", organizationId)
        .eq("status", "active")
        .in("role", ADD_BUSINESS_ROLES)
        .maybeSingle();

    return !error && data?.organization_id === organizationId;
}
