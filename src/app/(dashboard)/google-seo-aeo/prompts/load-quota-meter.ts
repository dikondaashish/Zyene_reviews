import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { computeQuotaMeter, type QuotaMeterResult } from "@/services/aeo/billing/quota-meter";
import { loadAeoBalance } from "@/services/aeo/billing/aeo-balance";

/**
 * F4.9: reads through the caller's RLS-scoped client - aeo_credit_balances'
 * own select policy is the isolation boundary, same as aeoVisibility.
 */
export async function loadQuotaMeter(
    db: SupabaseClient<Database>,
    organizationId: string,
    planId: string | null,
    activePrompts: number,
    runnableEngines: number
): Promise<QuotaMeterResult> {
    // Plan credit plus paid balance: both are spendable on tests.
    const balance = await loadAeoBalance(db, organizationId);

    return computeQuotaMeter({
        activePrompts,
        runnableEngines,
        planId,
        balanceMicroUsd: balance.totalMicroUsd,
    });
}
