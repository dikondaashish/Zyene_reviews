/**
 * E-9 ports. Orchestration talks to these, never to Supabase or Stripe
 * directly — same reason as orchestration/ports.ts: a crash test can assert
 * on real decisions against in-memory doubles before either the migration is
 * applied or a live Stripe key is anywhere near the process.
 */

export type ConsumeCreditResult = {
    /** What was drawn from the org's remaining monthly balance, in micro-USD. */
    debitedMicroUsd: number;
    /** What must be billed to Stripe because the balance could not cover it. */
    overageMicroUsd: number;
    remainingBalanceMicroUsd: number;
    /**
     * True when this sample was already settled by an earlier call — a step
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

    /**
     * Journals a successful Stripe overage charge for reconciliation. Called
     * only after chargeOverage returns `charged: true` — this is audit
     * history, not part of the debit decision, so it does not need the same
     * row-locked atomicity as consumeCredit.
     */
    recordOverageCharge(input: {
        organizationId: string;
        sampleId: string;
        amountMicroUsd: number;
        stripeInvoiceItemId: string;
    }): Promise<void>;
}

export type OverageChargeResult =
    | { charged: true; stripeInvoiceItemId: string }
    /**
     * The charge did not go through. Distinct from throwing: a customer whose
     * card was declined is not a bug, and the caller must still record the
     * attempt rather than silently losing track of unbilled overage.
     */
    | { charged: false; reason: string };

export interface OverageChargeGateway {
    /**
     * Idempotent per `sampleId` at the Stripe layer (an idempotency key derived
     * from it, not a lookup of our own), so a replayed billing step resolves to
     * the original charge instead of creating a second one.
     */
    chargeOverage(input: {
        sampleId: string;
        stripeCustomerId: string;
        amountMicroUsd: number;
    }): Promise<OverageChargeResult>;
}
