import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Business access is granted via organization membership (organization_members),
 * not the legacy business_members table. Aligns with getActiveBusinessId and
 * /api/requests/send ownership checks.
 */
export async function getBusinessIdsForUser(
    supabase: SupabaseClient,
    userId: string
): Promise<string[]> {
    const { data: memberships, error } = await supabase
        .from("organization_members")
        .select(`
            organizations (
                businesses ( id )
            )
        `)
        .eq("user_id", userId)
        .eq("status", "active");

    if (error || !memberships?.length) {
        return [];
    }

    const ids = new Set<string>();
    for (const row of memberships) {
        const org = (row as { organizations?: { businesses?: { id: string }[] } | null })
            .organizations;
        for (const b of org?.businesses ?? []) {
            ids.add(b.id);
        }
    }
    return [...ids];
}

export async function userCanAccessBusiness(
    supabase: SupabaseClient,
    userId: string,
    businessId: string
): Promise<boolean> {
    const ids = await getBusinessIdsForUser(supabase, userId);
    return ids.includes(businessId);
}
