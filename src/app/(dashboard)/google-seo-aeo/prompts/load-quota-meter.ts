import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { computeQuotaMeter, type QuotaMeterResult } from "@/services/aeo/billing/quota-meter";
import { assertAeoQueriesSucceeded } from "@/services/aeo/query-results";

/**
 * F4.9: reads through the caller's RLS-scoped client — aeo_credit_balances'
 * own select policy is the isolation boundary, same as aeoVisibility.
 */
export async function loadQuotaMeter(
    db: SupabaseClient<Database>,
    organizationId: string,
    planId: string | null,
    activePrompts: number,
    runnableEngines: number
): Promise<QuotaMeterResult> {
    const result = await db
        .from("aeo_credit_balances")
        .select("balance_micro_usd")
        .eq("organization_id", organizationId)
        .maybeSingle();
    assertAeoQueriesSucceeded("Unable to load AEO quota balance", result);
    const balanceRow = result.data;

    return computeQuotaMeter({
        activePrompts,
        runnableEngines,
        planId,
        balanceMicroUsd: balanceRow?.balance_micro_usd ?? null,
    });
}
