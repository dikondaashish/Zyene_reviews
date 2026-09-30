import "server-only";

import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";

export async function requirePhase2Context(manage = false) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const context = await getActiveBusinessId();
    if (!context.businessId || !context.business || !context.organization) throw new Error("Select a business first");
    const allowed = manage ? await canManageBusinessIntegration(supabase, user.id, context.businessId)
        : await userCanAccessBusiness(supabase, user.id, context.businessId, true);
    if (!allowed) throw new Error("Forbidden");
    return { user, businessId: context.businessId, organizationId: context.organization.id, business: context.business, admin: createAdminClient() };
}
