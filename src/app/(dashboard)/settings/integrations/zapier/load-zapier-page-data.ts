import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { getAppBaseUrl } from "@/config/env";
import { canManageApiKeys } from "@/lib/api-keys/scopes";
import { loadActiveApiKeySummary } from "@/services/api-keys/manage-api-keys";

export async function loadZapierPageData() {
    const { business } = await getActiveBusinessId();

    if (!business) {
        return { kind: "no-business" as const };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const [apiKey, member] = await Promise.all([
        loadActiveApiKeySummary(supabase, business.id, "review_requests:write"),
        supabase
        .from("business_members")
        .select("role")
        .eq("business_id", business.id)
        .eq("user_id", user?.id ?? "")
        .eq("status", "active")
        .maybeSingle(),
    ]);

    return {
        kind: "ok" as const,
        business,
        apiKey,
        canManageApiKeys: canManageApiKeys(member.data?.role),
        appBaseUrl: getAppBaseUrl(),
    };
}
