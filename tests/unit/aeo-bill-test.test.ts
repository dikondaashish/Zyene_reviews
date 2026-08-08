import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { billTest } from "../../src/services/aeo/billing/bill-test";
import { isLiveSamplingEnabled, isMeteredBillingLive } from "../../src/lib/features/aeo-surfaces";
import type {
    ConsumeCreditResult,
    CreditLedgerStore,
    OverageChargeGateway,
    OverageChargeResult,
} from "../../src/services/aeo/billing/ports";

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
    recordOverageCharge(): Promise<void> {
        throw new Error("recordOverageCharge must not run here");
    }
}
class ThrowingCharges implements OverageChargeGateway {
    chargeOverage(): Promise<OverageChargeResult> {
        throw new Error("chargeOverage must not run here");
    }
}

class FakeLedger implements CreditLedgerStore {
    consumeCalls: { organizationId: string; sampleId: string; testCostMicroUsd: number }[] = [];
    recordCalls: {
        organizationId: string;
        sampleId: string;
        amountMicroUsd: number;
        stripeInvoiceItemId: string;
    }[] = [];
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
    async recordOverageCharge(input: {
        organizationId: string;
        sampleId: string;
        amountMicroUsd: number;
        stripeInvoiceItemId: string;
    }) {
        this.recordCalls.push(input);
    }
}

class FakeCharges implements OverageChargeGateway {
    calls: { sampleId: string; stripeCustomerId: string; amountMicroUsd: number }[] = [];
    result: OverageChargeResult = { charged: true, stripeInvoiceItemId: "ii_fake" };
    async chargeOverage(input: { sampleId: string; stripeCustomerId: string; amountMicroUsd: number }) {
        this.calls.push(input);
        return this.result;
    }
}

const INPUT = { organizationId: "org-1", sampleId: "sample-1", stripeCustomerId: "cus_1" };

describe("billTest — the flag is the first line, before any I/O", () => {
    it("touches nothing when the flag is off, even with a customer on file", async () => {
        await billTest(INPUT, { ledger: new ThrowingLedger(), charges: new ThrowingCharges() });
        // No assertion needed beyond "did not throw" — the fakes throw if
        // reached, so completing at all IS the proof.
    });
});

describe("billTest — balance covers the whole test", () => {
    it("debits the balance and never calls Stripe", async () => {
        process.env[FLAG_KEY] = "true";
        const ledger = new FakeLedger();
        const charges = new FakeCharges();
        await billTest(INPUT, { ledger, charges });

        expect(ledger.consumeCalls).toEqual([
            { organizationId: "org-1", sampleId: "sample-1", testCostMicroUsd: 2_500_000 },
        ]);
        expect(charges.calls).toEqual([]);
    });
});

describe("billTest — balance is exhausted", () => {
    it("charges Stripe for the shortfall and journals the charge", async () => {
        process.env[FLAG_KEY] = "true";
        const ledger = new FakeLedger();
        ledger.result = {
            debitedMicroUsd: 1_000_000,
            overageMicroUsd: 1_500_000,
            remainingBalanceMicroUsd: 0,
            alreadyConsumed: false,
        };
        const charges = new FakeCharges();
        await billTest(INPUT, { ledger, charges });

        expect(charges.calls).toEqual([
            { sampleId: "sample-1", stripeCustomerId: "cus_1", amountMicroUsd: 1_500_000 },
        ]);
        expect(ledger.recordCalls).toEqual([
            {
                organizationId: "org-1",
                sampleId: "sample-1",
                amountMicroUsd: 1_500_000,
                stripeInvoiceItemId: "ii_fake",
            },
        ]);
    });

    it("does not journal a charge that Stripe declined", async () => {
        // Nothing to reconcile: no invoice item exists to point the ledger at.
        process.env[FLAG_KEY] = "true";
        const ledger = new FakeLedger();
        ledger.result = { debitedMicroUsd: 0, overageMicroUsd: 2_500_000, remainingBalanceMicroUsd: 0, alreadyConsumed: false };
        const charges = new FakeCharges();
        charges.result = { charged: false, reason: "card_declined" };
        await billTest(INPUT, { ledger, charges });

        expect(ledger.recordCalls).toEqual([]);
    });

    it("never calls Stripe when the org has no stripe_customer_id, however much overage is owed", async () => {
        // Should not be reachable in practice — an org with a balance has
        // necessarily checked out — but this must degrade to "log and stop",
        // never to charging an empty string as a customer id.
        process.env[FLAG_KEY] = "true";
        const ledger = new FakeLedger();
        ledger.result = { debitedMicroUsd: 0, overageMicroUsd: 2_500_000, remainingBalanceMicroUsd: 0, alreadyConsumed: false };
        const charges = new FakeCharges();
        await billTest({ ...INPUT, stripeCustomerId: null }, { ledger, charges });

        expect(charges.calls).toEqual([]);
    });
});

describe("billTest — a replayed step", () => {
    it("still re-issues the charge attempt; Stripe's own idempotency key is what makes that safe", async () => {
        // aeo_consume_credit's replay guard tells us the CREDIT decision was
        // already made — it cannot tell us whether the Stripe call after it
        // completed, so skipping the charge here on alreadyConsumed=true would
        // be able to strand real overage permanently unbilled.
        process.env[FLAG_KEY] = "true";
        const ledger = new FakeLedger();
        ledger.result = {
            debitedMicroUsd: 1_000_000,
            overageMicroUsd: 1_500_000,
            remainingBalanceMicroUsd: 0,
            alreadyConsumed: true,
        };
        const charges = new FakeCharges();
        await billTest(INPUT, { ledger, charges });

        expect(charges.calls).toHaveLength(1);
    });
});
