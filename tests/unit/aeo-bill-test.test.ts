import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { billTest } from "../../src/services/aeo/billing/bill-test";
import { isLiveSamplingEnabled, isMeteredBillingLive } from "../../src/lib/features/aeo-surfaces";
import { logger } from "../../src/lib/logger";
import type { ConsumeCreditResult, CreditLedgerStore } from "../../src/services/aeo/billing/ports";

const FLAG_KEY = "AEO_METERED_BILLING_LIVE";
const original = process.env[FLAG_KEY];

beforeEach(() => {
    delete process.env[FLAG_KEY];
});

afterEach(() => {
    if (original === undefined) delete process.env[FLAG_KEY];
    else process.env[FLAG_KEY] = original;
});

describe("isMeteredBillingLive", () => {
    it("defaults to disabled, so a fresh deployment charges no card", () => {
        expect(isMeteredBillingLive()).toBe(false);
    });

    it("enables only on an explicit true", () => {
        process.env[FLAG_KEY] = "true";
        expect(isMeteredBillingLive()).toBe(true);
    });

    it.each(["", "1", "yes", "TRUE!", "false"])("stays disabled for the ambiguous value %j", (value) => {
        process.env[FLAG_KEY] = value;
        expect(isMeteredBillingLive()).toBe(false);
    });

    it("is independent of AEO_LIVE_SAMPLING — sampling and billing are different decisions", () => {
        process.env.AEO_LIVE_SAMPLING = "true";
        expect(isMeteredBillingLive()).toBe(false);
        expect(isLiveSamplingEnabled()).toBe(true);
        delete process.env.AEO_LIVE_SAMPLING;
    });
});

/** Throws if called — proves the flag gate stops execution before any I/O. */
class ThrowingLedger implements CreditLedgerStore {
    consumeCredit(): Promise<ConsumeCreditResult> {
        throw new Error("consumeCredit must not run while the flag is off");
    }
    resetGrant(): Promise<void> {
        throw new Error("resetGrant must not run while the flag is off");
    }
}

class FakeLedger implements CreditLedgerStore {
    consumeCalls: { organizationId: string; sampleId: string; testCostMicroUsd: number }[] = [];
    result: ConsumeCreditResult = {
        debitedMicroUsd: 2_500_000,
        overageMicroUsd: 0,
        remainingBalanceMicroUsd: 2_500_000,
        alreadyConsumed: false,
    };
    async consumeCredit(input: { organizationId: string; sampleId: string; testCostMicroUsd: number }) {
        this.consumeCalls.push(input);
        return this.result;
    }
    async resetGrant() {}
}

const INPUT = { organizationId: "org-1", sampleId: "sample-1" };

describe("billTest — the flag is the first line, before any I/O", () => {
    it("touches nothing when the flag is off", async () => {
        // The fake throws if reached, so completing at all IS the proof.
        await billTest(INPUT, { ledger: new ThrowingLedger() });
    });
});

describe("billTest — prepaid balance", () => {
    it("debits one test ($2.50) from the balance", async () => {
        process.env[FLAG_KEY] = "true";
        const ledger = new FakeLedger();
        await billTest(INPUT, { ledger });

        expect(ledger.consumeCalls).toEqual([
            { organizationId: "org-1", sampleId: "sample-1", testCostMicroUsd: 2_500_000 },
        ]);
    });

    it("absorbs and logs a shortfall instead of charging anything", async () => {
        // Parallel tests can race past the last few dollars. The customer
        // prepaid, so the shortfall is ours - there is no charge path at all.
        process.env[FLAG_KEY] = "true";
        const warn = vi.spyOn(logger, "warn").mockImplementation(() => logger);
        const ledger = new FakeLedger();
        ledger.result = { debitedMicroUsd: 1_000_000, overageMicroUsd: 1_500_000, remainingBalanceMicroUsd: 0, alreadyConsumed: false };

        await expect(billTest(INPUT, { ledger })).resolves.toBeUndefined();
        expect(warn).toHaveBeenCalledTimes(1);
        warn.mockRestore();
    });

    it("does not log a replayed step's shortfall a second time", async () => {
        process.env[FLAG_KEY] = "true";
        const warn = vi.spyOn(logger, "warn").mockImplementation(() => logger);
        const ledger = new FakeLedger();
        ledger.result = { debitedMicroUsd: 0, overageMicroUsd: 2_500_000, remainingBalanceMicroUsd: 0, alreadyConsumed: true };

        await billTest(INPUT, { ledger });
        expect(warn).not.toHaveBeenCalled();
        warn.mockRestore();
    });
});
