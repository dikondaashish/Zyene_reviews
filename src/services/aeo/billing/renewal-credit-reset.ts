import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { isMeteredBillingLive } from "@/lib/features/aeo-surfaces";
import { PLAN_CREDIT_GRANTS_MICRO_USD } from "./billing-constants";
import { SupabaseCreditLedgerStore } from "./supabase-credit-ledger-store";

/**
 * One function for both the DAY-ONE grant (checkout.session.completed) and
 * every RENEWAL (invoice.payment_succeeded, subscription_cycle) — "reset, not
 * add" is the correct operation for both: a brand-new org has no balance to
 * preserve, and a renewing org's leftover balance is exactly what does not
 * roll over.
 *
 * Callers own their own error isolation. This throws on a real failure rather
 * than swallowing it, so the caller's try/catch — which exists specifically
 * to protect a payment-success email or a subscription record from a bug in
 * this newer, less-proven feature — is what actually decides the blast
 * radius, not this function guessing at it.
 */
export async function resetAeoCreditsForPlan(
    db: SupabaseClient<Database>,
    input: { organizationId: string; planId: string | null | undefined }
): Promise<void> {
    if (!isMeteredBillingLive()) return;
    if (!input.planId) return;

    const grantedMicroUsd = PLAN_CREDIT_GRANTS_MICRO_USD[input.planId];
    // Enterprise, or any plan id this map does not know: no AEO credit line
    // exists for it yet. Silently doing nothing is correct here — this is not
    // a missing case to warn about, it is every plan E-9 has not priced.
    if (grantedMicroUsd === undefined) return;

    await new SupabaseCreditLedgerStore(db).resetGrant({
        organizationId: input.organizationId,
        grantedMicroUsd,
    });
}
