import { logger } from "@/lib/logger";
import { isMeteredBillingLive } from "@/lib/features/aeo-surfaces";
import { ONE_TEST_MICRO_USD } from "./billing-constants";
import type { CreditLedgerStore, OverageChargeGateway } from "./ports";

export type BillTestInput = {
    organizationId: string;
    sampleId: string;
    /** Null when the org has never completed Google checkout — no card to bill. */
    stripeCustomerId: string | null;
};

export type BillTestDeps = {
    ledger: CreditLedgerStore;
    charges: OverageChargeGateway;
};

/**
 * E-9: the one call site that turns a settled test into money moving.
 *
 * Called only for a sample whose `result.status === "ok"` — that status check
 * IS the "one test" definition, confirmed 2026-08-08: a call the vendor billed
 * us for but that returned no usable answer is absorbed as our own cost, never
 * passed to the customer.
 *
 * The flag check is the unconditional first line, before touching the
 * database or Stripe, so this function is a true no-op — not a query against
 * tables a migration may not have created yet — for every environment that
 * has not explicitly turned metered billing on. See isMeteredBillingLive.
 */
export async function billTest(input: BillTestInput, deps: BillTestDeps): Promise<void> {
    if (!isMeteredBillingLive()) return;

    const { debitedMicroUsd, overageMicroUsd, alreadyConsumed } = await deps.ledger.consumeCredit({
        organizationId: input.organizationId,
        sampleId: input.sampleId,
        testCostMicroUsd: ONE_TEST_MICRO_USD,
    });

    if (overageMicroUsd <= 0) return;

    // A replayed step whose overage was ALREADY billed on the first pass must
    // not bill it again. The credit ledger's replay guard tells us this was a
    // repeat, but it cannot tell us whether the Stripe call after it
    // succeeded — only Stripe's own idempotency key (inside chargeOverage)
    // can, so the charge call itself still runs; it is guaranteed safe to
    // repeat, not guaranteed unnecessary to repeat.
    if (alreadyConsumed) {
        logger.info(
            { sampleId: input.sampleId, debitedMicroUsd, overageMicroUsd },
            "[AEO] billing step replayed; re-issuing the idempotent overage charge"
        );
    }

    if (!input.stripeCustomerId) {
        // Should not be reachable: an org with a credit balance has necessarily
        // completed checkout. Logged rather than thrown — the test already
        // happened and the ledger already recorded it; failing loudly here
        // would not undo either, only obscure why overage went unbilled.
        logger.error(
            { organizationId: input.organizationId, sampleId: input.sampleId, overageMicroUsd },
            "[AEO] overage owed but organization has no stripe_customer_id"
        );
        return;
    }

    const result = await deps.charges.chargeOverage({
        sampleId: input.sampleId,
        stripeCustomerId: input.stripeCustomerId,
        amountMicroUsd: overageMicroUsd,
    });

    if (!result.charged) {
        logger.error(
            { organizationId: input.organizationId, sampleId: input.sampleId, reason: result.reason },
            "[AEO] overage charge failed"
        );
        return;
    }

    await deps.ledger.recordOverageCharge({
        organizationId: input.organizationId,
        sampleId: input.sampleId,
        amountMicroUsd: overageMicroUsd,
        stripeInvoiceItemId: result.stripeInvoiceItemId,
    });
}
