import "server-only";

import { createAdminClient } from "@/lib/db/supabase/admin";

/**
 * Whether another business already uses this public link. Links are unique across all of Zyene
 * (`businesses_slug_key`), but row-level security only lets an owner read their own businesses,
 * so this check reads with the admin client. It reveals only taken or free, which anyone can
 * already learn by opening the public review page.
 */
export async function isSlugTakenByAnotherBusiness(slug: string, businessId?: string | null): Promise<boolean> {
    let query = createAdminClient().from("businesses").select("id").eq("slug", slug).limit(1);
    if (businessId) query = query.neq("id", businessId);
    const { data, error } = await query;
    if (error) throw error;
    return (data?.length ?? 0) > 0;
}
