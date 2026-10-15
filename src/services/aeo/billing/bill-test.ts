import { logger } from "@/lib/logger";
import { isMeteredBillingLive } from "@/lib/features/aeo-surfaces";
import { ONE_TEST_MICRO_USD } from "./billing-constants";
import type { CreditLedgerStore } from "./ports";

export type BillTestInput = {
    organizationId: string;
    sampleId: string;
};

export type BillTestDeps = {
    ledger: CreditLedgerStore;
};

/**
 * E-9: settles one successful test against the org's prepaid balance.
 *
 * Called only for a sample whose `result.status === "ok"` - that status check
 * IS the "one test" definition: a call the vendor billed us for but that
 * returned no usable answer is absorbed as our own cost.
 *
 * Prepaid model (2026-10-14): no card is ever charged here. The planner and
 * the dispatch worker refuse to start tests the balance cannot cover, so a
 * shortfall only happens when parallel tests race past the last few dollars.
 * That shortfall is absorbed and logged, never billed - the customer agreed to
 * pay up front, not to surprise charges.
 *
 * The flag check is the unconditional first line, so this is a true no-op for
 * every environment that has not explicitly turned metered billing on.
 */
export async function billTest(input: BillTestInput, deps: BillTestDeps): Promise<void> {
    if (!isMeteredBillingLive()) return;

    const { overageMicroUsd, alreadyConsumed } = await deps.ledger.consumeCredit({
        organizationId: input.organizationId,
        sampleId: input.sampleId,
        testCostMicroUsd: ONE_TEST_MICRO_USD,
    });

    if (overageMicroUsd > 0 && !alreadyConsumed) {
        logger.warn(
            { organizationId: input.organizationId, sampleId: input.sampleId, overageMicroUsd },
            "[AEO] test ran past the prepaid balance; shortfall absorbed, not charged"
        );
    }
}
