import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { isMeteredBillingLive } from "@/lib/features/aeo-surfaces";
import { ONE_TEST_MICRO_USD } from "./billing-constants";

/**
 * Prepaid AEO balance: plan credit (reset each cycle) plus money the customer
 * paid for through "Add balance" (never expires). Tests pause when the total
 * cannot cover one more test - no card is charged automatically.
 */
export type AeoBalance = {
    planMicroUsd: number;
    planGrantedMicroUsd: number;
    purchasedMicroUsd: number;
    totalMicroUsd: number;
    testsRemaining: number;
};

type BalanceRow = {
    balance_micro_usd: number | string;
    granted_micro_usd: number | string;
    purchased_balance_micro_usd: number | string;
};

/** Isolated cast: purchased_balance_micro_usd is not in generated database.types.ts yet. */
async function selectBalanceRow(db: SupabaseClient<Database>, organizationId: string) {
    const untyped = db as unknown as {
        from: (table: "aeo_credit_balances") => {
            select: (columns: string) => {
                eq: (column: "organization_id", value: string) => {
                    maybeSingle: () => Promise<{ data: BalanceRow | null; error: { message: string } | null }>;
                };
            };
        };
    };
    return untyped
        .from("aeo_credit_balances")
        .select("balance_micro_usd, granted_micro_usd, purchased_balance_micro_usd")
        .eq("organization_id", organizationId)
        .maybeSingle();
}

export function toAeoBalance(row: BalanceRow | null): AeoBalance {
    const planMicroUsd = Number(row?.balance_micro_usd ?? 0);
    const purchasedMicroUsd = Number(row?.purchased_balance_micro_usd ?? 0);
    const totalMicroUsd = planMicroUsd + purchasedMicroUsd;
    return {
        planMicroUsd,
        planGrantedMicroUsd: Number(row?.granted_micro_usd ?? 0),
        purchasedMicroUsd,
        totalMicroUsd,
        testsRemaining: Math.floor(totalMicroUsd / ONE_TEST_MICRO_USD),
    };
}

/** No row means the org was never granted or topped up: a $0 balance, not an error. */
export async function loadAeoBalance(db: SupabaseClient<Database>, organizationId: string): Promise<AeoBalance> {
    const { data, error } = await selectBalanceRow(db, organizationId);
    if (error) throw new Error(`loadAeoBalance failed: ${error.message}`);
    return toAeoBalance(data);
}

/**
 * How many tests this org may start right now. `null` = unlimited, because
 * metered billing is off and nothing is being counted against a balance.
 */
export async function loadAffordableTests(
    db: SupabaseClient<Database>,
    organizationId: string
): Promise<number | null> {
    if (!isMeteredBillingLive()) return null;
    return (await loadAeoBalance(db, organizationId)).testsRemaining;
}
