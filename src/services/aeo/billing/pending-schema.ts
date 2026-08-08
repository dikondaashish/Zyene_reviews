import type { Database } from "@/lib/db/supabase/database.types";

/**
 * `20260808200000_aeo_credit_ledger.sql` is designed and dry-run verified
 * against production (all constraints, replay-idempotency, and the privilege
 * lockdown confirmed with real queries) but NOT YET APPLIED, so the generated
 * `Database` type does not know aeo_consume_credit, aeo_reset_credit_grant,
 * aeo_credit_ledger_entries, or aeo_credit_balances. This describes exactly
 * what `pnpm supabase gen types` will produce once the migration is applied.
 *
 * Delete this file and every cast to ExtendedDatabase the moment that
 * happens — it exists only to keep the billing module checked against an
 * accurate shape instead of reaching for `any`. Mirrors the same situation
 * and the same fix already used in google-platform-credentials.ts for
 * granted_scopes. Shared across the billing module rather than redeclared per
 * file, so the two cannot drift apart from each other.
 */

export type ConsumeCreditRow = {
    debited_micro_usd: number;
    overage_micro_usd: number;
    remaining_balance_micro_usd: number;
    already_consumed: boolean;
};

export type CreditLedgerEntryInsert = {
    organization_id: string;
    sample_id?: string | null;
    kind: "grant_reset" | "credit_consumed" | "overage_charged";
    amount_micro_usd: number;
    stripe_invoice_item_id?: string | null;
};

export type CreditBalanceRow = {
    organization_id: string;
    granted_micro_usd: number;
    balance_micro_usd: number;
    cycle_reset_at: string;
    updated_at: string;
};

export type ExtendedDatabase = Database & {
    public: {
        Functions: {
            aeo_consume_credit: {
                Args: { p_organization_id: string; p_sample_id: string; p_test_cost_micro_usd: number };
                Returns: ConsumeCreditRow[];
            };
            aeo_reset_credit_grant: {
                Args: { p_organization_id: string; p_granted_micro_usd: number };
                Returns: undefined;
            };
        };
        Tables: {
            aeo_credit_ledger_entries: {
                Row: CreditLedgerEntryInsert & { id: string; created_at: string };
                Insert: CreditLedgerEntryInsert;
                Update: Partial<CreditLedgerEntryInsert>;
                Relationships: [];
            };
            aeo_credit_balances: {
                Row: CreditBalanceRow;
                Insert: Omit<CreditBalanceRow, "updated_at"> & { updated_at?: string };
                Update: Partial<CreditBalanceRow>;
                Relationships: [];
            };
        };
    };
};
