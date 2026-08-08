import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import type { ConsumeCreditResult, CreditLedgerStore } from "./ports";

type Admin = SupabaseClient<Database>;

type ConsumeCreditRow = {
    debited_micro_usd: number;
    overage_micro_usd: number;
    remaining_balance_micro_usd: number;
    already_consumed: boolean;
};

type CreditLedgerEntryInsert = {
    organization_id: string;
    sample_id?: string | null;
    kind: "grant_reset" | "credit_consumed" | "overage_charged";
    amount_micro_usd: number;
    stripe_invoice_item_id?: string | null;
};

/**
 * `20260808200000_aeo_credit_ledger.sql` is designed and dry-run verified
 * against production (all constraints, replay-idempotency, and the privilege
 * lockdown confirmed with real queries) but NOT YET APPLIED, so the generated
 * `Database` type does not know aeo_consume_credit, aeo_reset_credit_grant, or
 * aeo_credit_ledger_entries. This describes exactly what
 * `pnpm supabase gen types` will produce once the migration is applied.
 *
 * Delete this type and the casts below together the moment that happens —
 * they exist only to keep the rest of this file checked against an accurate
 * shape instead of reaching for `any`. Mirrors the same situation and the
 * same fix already used in google-platform-credentials.ts for granted_scopes.
 */
type ExtendedDatabase = Database & {
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
        };
    };
};

/**
 * Thin wrapper over aeo_consume_credit / aeo_reset_credit_grant.
 *
 * The decision logic — atomicity under concurrent samples, replay-safety on
 * sample_id, "no rollover" on reset — lives entirely in the SQL functions
 * (20260808200000_aeo_credit_ledger.sql), not duplicated here. A JS mirror of
 * that logic would need its own row lock to be correct under concurrency,
 * which means it would just be a worse copy of the SQL function; keeping one
 * copy is what keeps the two impossible to drift apart.
 */
export class SupabaseCreditLedgerStore implements CreditLedgerStore {
    private readonly db: SupabaseClient<ExtendedDatabase>;

    constructor(db: Admin) {
        this.db = db as unknown as SupabaseClient<ExtendedDatabase>;
    }

    async consumeCredit(input: {
        organizationId: string;
        sampleId: string;
        testCostMicroUsd: number;
    }): Promise<ConsumeCreditResult> {
        const { data, error } = await this.db
            .rpc("aeo_consume_credit", {
                p_organization_id: input.organizationId,
                p_sample_id: input.sampleId,
                p_test_cost_micro_usd: input.testCostMicroUsd,
            })
            .single();

        if (error) throw new Error(`aeo_consume_credit failed: ${error.message}`);

        return {
            debitedMicroUsd: Number(data.debited_micro_usd),
            overageMicroUsd: Number(data.overage_micro_usd),
            remainingBalanceMicroUsd: Number(data.remaining_balance_micro_usd),
            alreadyConsumed: data.already_consumed,
        };
    }

    async resetGrant(input: { organizationId: string; grantedMicroUsd: number }): Promise<void> {
        const { error } = await this.db.rpc("aeo_reset_credit_grant", {
            p_organization_id: input.organizationId,
            p_granted_micro_usd: input.grantedMicroUsd,
        });

        if (error) throw new Error(`aeo_reset_credit_grant failed: ${error.message}`);
    }

    async recordOverageCharge(input: {
        organizationId: string;
        sampleId: string;
        amountMicroUsd: number;
        stripeInvoiceItemId: string;
    }): Promise<void> {
        const { error } = await this.db.from("aeo_credit_ledger_entries").insert({
            organization_id: input.organizationId,
            sample_id: input.sampleId,
            kind: "overage_charged",
            amount_micro_usd: input.amountMicroUsd,
            stripe_invoice_item_id: input.stripeInvoiceItemId,
        });

        // 23505: a replayed billing step re-issued the same idempotent Stripe
        // charge and is now recording it a second time. Same object, same
        // invoice item id, so the conflict IS the correctness — one real
        // charge, one audit row.
        if (error && error.code !== "23505") {
            throw new Error(`recordOverageCharge failed: ${error.message}`);
        }
    }
}
