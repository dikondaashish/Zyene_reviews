"use server";

import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getActiveBusinessId } from "@/lib/auth/business-context";

export async function requirePhase2Context() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const context = await getActiveBusinessId();
    if (!context.businessId || !context.business || !context.organization) throw new Error("Select a business first");
    return { user, businessId: context.businessId, organizationId: context.organization.id, business: context.business, admin: createAdminClient() };
}
