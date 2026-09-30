import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { apiError } from "@/app/api/_shared/responses";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { aiRateLimit } from "@/lib/auth/rate-limit";
import { planAllowsAiReviewFeatures } from "@/services/stripe/plans";

export async function authorizeInsights(
    supabase: SupabaseClient<Database>, userId: string, businessId: string, requestId: string,
) {
    // Cached context is a selector, not evidence of current tenant access.
    if (!(await userCanAccessBusiness(supabase, userId, businessId))) {
        return { response: apiError("Forbidden", { status: 403, details: requestId }) };
    }
    const { data: business, error } = await supabase.from("businesses")
        .select("name, organization_id").eq("id", businessId).single();
    if (error || !business?.organization_id) {
        return { response: apiError("Business not found", { status: 404, details: requestId }) };
    }
    const { data: organization } = await supabase.from("organizations")
        .select("plan, plan_status").eq("id", business.organization_id).single();
    if (!organization || !planAllowsAiReviewFeatures(organization.plan, organization.plan_status)) {
        return { response: apiError("AI insights require an active paid plan.", {
            status: 403, code: "AI_INSIGHTS_PLAN_REQUIRED", details: requestId,
        }) };
    }
    const { success } = await aiRateLimit.limit(userId);
    if (!success) return { response: apiError("AI rate limit exceeded.", { status: 429, details: requestId }) };
    return { response: null, business };
}
