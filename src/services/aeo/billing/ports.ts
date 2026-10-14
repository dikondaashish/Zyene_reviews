/**
 * E-9 ports. Orchestration talks to these, never to Supabase
 * directly - same reason as orchestration/ports.ts: a crash test can assert
 * on real decisions against in-memory doubles before either the migration is
 * applied.
 */

export type ConsumeCreditResult = {
    /** What was drawn from plan credit plus paid balance, in micro-USD. */
    debitedMicroUsd: number;
    /** What the balance could not cover. Absorbed, never billed (prepaid model). */
    overageMicroUsd: number;
    remainingBalanceMicroUsd: number;
    /**
     * True when this sample was already settled by an earlier call - a step
     * replay, not a new test. `debitedMicroUsd`/`overageMicroUsd` are the
     * ORIGINAL decision, not recomputed, so a caller cannot double-charge by
     * treating a replay as fresh.
     */
    alreadyConsumed: boolean;
};

export interface CreditLedgerStore {
    /**
     * Atomic and idempotent on `sampleId` (aeo_consume_credit). Safe to call
     * again after a crash: the second call returns the first call's result
     * rather than debiting twice.
     */
    consumeCredit(input: {
        organizationId: string;
        sampleId: string;
        testCostMicroUsd: number;
    }): Promise<ConsumeCreditResult>;

    /** Resets (never adds to) an org's balance to its plan's per-cycle grant. */
    resetGrant(input: { organizationId: string; grantedMicroUsd: number }): Promise<void>;
}
