import type { SupabaseClient } from "@supabase/supabase-js";
import { FREE_LIMITS } from "@/services/stripe/plans";
import { planLimitsToOrganizationColumns } from "@/services/stripe/webhook-plan-columns";

export const canceledBillingProjection = () => ({
    plan: "free", plan_status: "canceled", trial_ends_at: null,
    ...planLimitsToOrganizationColumns(FREE_LIMITS),
});

/** Generated database types intentionally remain untouched until schema deploy. */
export async function applySubscriptionProjection(
    db: SupabaseClient,
    customerId: string,
    subscriptionId: string,
    projection: Record<string, unknown>,
    options: { clear?: boolean; bindOrganizationId?: string; expectedSubscriptionId?: string | null; observedAt?: string } = {},
): Promise<string | null> {
    const { data, error } = await db.rpc("apply_stripe_subscription_projection", {
        p_customer_id: customerId, p_subscription_id: subscriptionId, p_projection: projection,
        p_clear: options.clear ?? false, p_bind_organization_id: options.bindOrganizationId ?? null,
        p_expected_subscription_id: options.expectedSubscriptionId ?? null,
        p_observed_at: options.observedAt ?? new Date().toISOString(),
    });
    if (error) throw error;
    if (data !== null && typeof data !== "string") throw new Error("Invalid billing projection response");
    return data;
}
