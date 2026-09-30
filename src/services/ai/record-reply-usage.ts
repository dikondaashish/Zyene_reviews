import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";

/** Derive the charged organization from a freshly authorized business, not a request ID. */
export async function recordAiReplyUsage(supabase: SupabaseClient<Database>, businessId: string) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || !(await userCanAccessBusiness(supabase, user.id, businessId))) {
        throw new Error("AI usage accounting denied");
    }
    const { data: business, error } = await supabase.from("businesses")
        .select("organization_id").eq("id", businessId).maybeSingle();
    if (error || !business?.organization_id) throw new Error("AI usage accounting denied");

    const admin = createAdminClient();
    const { error: usageError } = await admin.rpc("increment_ai_replies_used", {
        org_id: business.organization_id,
    });
    if (usageError) throw new Error("AI usage accounting failed");
}
