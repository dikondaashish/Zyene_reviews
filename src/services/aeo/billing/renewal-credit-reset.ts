import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { isMeteredBillingLive } from "@/lib/features/aeo-surfaces";
import { PLAN_CREDIT_GRANTS_MICRO_USD } from "./billing-constants";

/**
 * One function for both the DAY-ONE grant (checkout.session.completed) and
 * every RENEWAL (invoice.payment_succeeded, subscription_cycle) - "reset, not
 * add" is the correct operation for both: a brand-new org has no balance to
 * preserve, and a renewing org's leftover balance is exactly what does not
 * roll over.
 *
 * A receipt and cycle watermark prevent retries from refilling spent credits.
 * Financial failures propagate so the webhook remains retryable.
 */
export async function resetAeoCreditsForPlan(
    db: SupabaseClient<Database>,
    input: { organizationId: string; planId: string | null | undefined; customerId: string;
        subscriptionId: string; receiptId: string; periodEnd: number | undefined }
): Promise<void> {
    if (!isMeteredBillingLive()) return;
    if (!input.planId) return;

    const grantedMicroUsd = PLAN_CREDIT_GRANTS_MICRO_USD[input.planId];
    // Enterprise, or any plan id this map does not know: no AEO credit line
    // exists for it yet. Silently doing nothing is correct here - this is not
    // a missing case to warn about, it is every plan E-9 has not priced.
    if (grantedMicroUsd === undefined) return;

    if (!input.periodEnd || !Number.isSafeInteger(input.periodEnd)) throw new Error("Credit grant period missing");
    const { data, error } = await db.rpc("apply_stripe_credit_grant" as never, {
        p_organization_id: input.organizationId, p_granted_micro_usd: grantedMicroUsd,
        p_customer_id: input.customerId, p_subscription_id: input.subscriptionId,
        p_receipt_id: input.receiptId, p_plan_id: input.planId,
        p_period_end: new Date(input.periodEnd * 1000).toISOString(),
    } as never);
    if (error) throw error;
    if (typeof data !== "boolean") throw new Error("Invalid credit grant response");
}
