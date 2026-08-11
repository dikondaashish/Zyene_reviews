import { describe, expect, it } from "vitest";

import {
    openReservation,
    reservationKey,
    settleReservation,
    type Reservation,
} from "../../src/services/aeo/ledger/quota-reservation";
import {
    expireReservation,
    isExpired,
    releaseReservation,
    RESERVATION_TTL_MS,
} from "../../src/services/aeo/ledger/quota-sweep";
import {
    billedUnits,
    consumedUnits,
    settledCostMicroUsd,
} from "../../src/services/aeo/ledger/quota-rollup";
import { planEngineBudget } from "../../src/services/aeo/scheduler/daily-budget";
import {
    citationsUnavailable,
    engineError,
    failedSample,
    okSample,
} from "../../src/services/aeo/engines/engine-result";

const AT = new Date("2026-08-06T03:00:00Z");

const base = {
    organizationId: "org-1",
    engineId: "gemini" as const,
    usageDate: "2026-08-06",
    units: 100,
    overageAuthorised: false,
    runId: "run-1",
    promptId: "prompt-1",
    attempt: 1,
    now: AT,
};

const ok = (cost: number) =>
    okSample({
        modelId: "gemini-2.5-pro",
        answerText: "x",
        citations: citationsUnavailable(),
        latencyMs: 10,
        costUnits: cost,
    });

describe("reservationKey", () => {
    it("is stable across retries of the same work", () => {
        const args = { runId: "r", promptId: "p", engineId: "gemini" as const, attempt: 2 };
        expect(reservationKey(args)).toBe(reservationKey(args));
        expect(reservationKey(args)).toBe("r:p:gemini:2");
    });

    it("separates attempts, so repeat sampling is not deduplicated away", () => {
        const a = { runId: "r", promptId: "p", engineId: "gemini" as const, attempt: 1 };
        expect(reservationKey(a)).not.toBe(reservationKey({ ...a, attempt: 2 }));
    });

    it("carries no timestamp or random component", () => {
        // A key that varied per call would silently disable duplicate protection
        // on exactly the Inngest step retry it exists to guard.
        const args = { runId: "r", promptId: "p", engineId: "chatgpt" as const, attempt: 1 };
        const first = reservationKey(args);
        expect(reservationKey(args)).toBe(first);
        expect(first).not.toMatch(/\d{13}/);
    });
});

describe("write-ahead ordering", () => {
    it("claims units before any call, billing nothing yet", () => {
        const r = openReservation(base);
        expect(r.state).toBe("reserved");
        expect(r.reservedUnits).toBe(100);
        expect(r.billableUnits).toBe(0);
        expect(r.costMicroUsd).toBe(0);
    });

    // QA #52: the authorisation is durable before the first billable call.
    it("records the overage authorisation at reservation time, not at settlement", () => {
        const r = openReservation({ ...base, overageAuthorised: true });
        expect(r.overageAuthorised).toBe(true);
        // Survives settlement unchanged — it is a record of what was authorised,
        // not a derived property of what happened.
        expect(settleReservation(r, [ok(100)], { billableUnits: 100, costMicroUsd: 3_500_000 }, AT).overageAuthorised).toBe(true);
    });

    it("counts an in-flight reservation as fully consumed", () => {
        // The conservative direction: assume it will be charged.
        expect(consumedUnits([openReservation(base)])).toBe(100);
    });
});

describe("settlement reconciles to what was actually charged", () => {
    it("bills only the samples that cost something", () => {
        const r = openReservation(base);
        const results = [ok(1), ok(1), failedSample({ modelId: "m", error: engineError("timeout", "t"), latencyMs: 1 })];
        const settled = settleReservation(r, results, { billableUnits: 2, costMicroUsd: 70_000 }, AT);
        expect(settled.state).toBe("settled");
        expect(settled.billableUnits).toBe(2);
        expect(settled.costMicroUsd).toBe(70_000);
        expect(settled.settledAt).toBe(AT.toISOString());
    });

    it("releases the whole reservation when every call failed for free", () => {
        // Pure write-ahead would keep overcounting these forever; 429s are common.
        const r = openReservation(base);
        const failures = [
            failedSample({ modelId: "m", error: engineError("rate_limited", "429"), latencyMs: 1 }),
            failedSample({ modelId: "m", error: engineError("rate_limited", "429"), latencyMs: 1 }),
        ];
        const settled = settleReservation(r, failures, { billableUnits: 0, costMicroUsd: 35_000 }, AT);
        expect(settled.billableUnits).toBe(0);
        expect(settled.costMicroUsd).toBe(0);
        expect(settled.settledUnits).toBe(0);
        expect(consumedUnits([settled])).toBe(0);
    });

    it("still bills a failure the vendor charged for", () => {
        // Some engines charge for a refusal; EngineSampleResult carries costUnits
        // on the failed variant precisely so this is representable.
        const r = openReservation(base);
        const paidFailure = failedSample({
            modelId: "m",
            error: engineError("upstream_unavailable", "503"),
            latencyMs: 1,
            costUnits: 1,
        });
        expect(settleReservation(r, [paidFailure], { billableUnits: 1, costMicroUsd: 35_000 }, AT).billableUnits).toBe(1);
    });

    it("records the cost passed in rather than re-deriving it from the catalog", () => {
        // Substituting our expected rate would hide a vendor price change.
        const r = openReservation(base);
        expect(settleReservation(r, [ok(1)], { billableUnits: 1, costMicroUsd: 99_999 }, AT).costMicroUsd).toBe(99_999);
    });
});

describe("free-allowance consumption is not free-allowance cost", () => {
    /**
     * The case a production dry-run of the migration rejected. A grounded call
     * inside the free bucket consumes a unit and costs nothing, so the two
     * quantities genuinely differ. Collapsing them forces a choice between a row
     * the database refuses and recording zero consumption for work that really
     * drained the bucket — and the second tells the budget guard the allowance
     * is untouched, letting it authorise more spend.
     */
    it("records consumption with zero cost", () => {
        const settled = settleReservation(
            openReservation({ ...base, units: 4_000 }),
            [ok(4_000)],
            { billableUnits: 0, costMicroUsd: 0 },
            AT
        );
        expect(settled.settledUnits).toBe(4_000);
        expect(settled.billableUnits).toBe(0);
        expect(settled.costMicroUsd).toBe(0);
    });

    it("drains the allowance even though nothing was charged", () => {
        const settled = settleReservation(
            openReservation({ ...base, units: 4_000 }),
            [ok(4_000)],
            { billableUnits: 0, costMicroUsd: 0 },
            AT
        );
        expect(consumedUnits([settled])).toBe(4_000);
        expect(billedUnits([settled])).toBe(0);
    });

    it("cannot bill more units than were consumed", () => {
        const settled = settleReservation(
            openReservation({ ...base, units: 100 }),
            [ok(10)],
            { billableUnits: 999, costMicroUsd: 1 },
            AT
        );
        expect(settled.settledUnits).toBe(10);
        expect(settled.billableUnits).toBe(10);
    });
});

describe("state machine refuses double-accounting", () => {
    const settled = settleReservation(openReservation(base), [ok(1)], { billableUnits: 1, costMicroUsd: 35_000 }, AT);

    it("cannot settle twice", () => {
        expect(() => settleReservation(settled, [ok(1)], { billableUnits: 1, costMicroUsd: 35_000 }, AT)).toThrow(/state "settled"/);
    });

    it("cannot release a settled reservation", () => {
        expect(() => releaseReservation(settled)).toThrow(/state "settled"/);
    });

    it("cannot settle a released reservation", () => {
        const released = releaseReservation(openReservation(base), AT);
        expect(() => settleReservation(released, [ok(1)], { billableUnits: 1, costMicroUsd: 35_000 }, AT)).toThrow(/state "released"/);
    });
});

describe("crash recovery", () => {
    const stale = openReservation({ ...base, now: new Date("2026-08-06T03:00:00Z") });

    it("does not expire a reservation inside its TTL", () => {
        const justInside = new Date(AT.getTime() + RESERVATION_TTL_MS - 1);
        expect(isExpired(stale, justInside)).toBe(false);
    });

    it("expires one whose run died before settling", () => {
        const past = new Date(AT.getTime() + RESERVATION_TTL_MS + 1);
        expect(isExpired(stale, past)).toBe(true);
        expect(consumedUnits([expireReservation(stale, past)])).toBe(0);
    });

    it("never expires a reservation that already reached a terminal state", () => {
        const done = settleReservation(openReservation(base), [ok(1)], { billableUnits: 1, costMicroUsd: 35_000 }, AT);
        expect(isExpired(done, new Date("2027-01-01T00:00:00Z"))).toBe(false);
    });
});

describe("consumedUnits feeds the budget guard", () => {
    const mixed: Reservation[] = [
        settleReservation(openReservation({ ...base, units: 600 }), [ok(600)], { billableUnits: 0, costMicroUsd: 0 }, AT),
        openReservation({ ...base, units: 450, promptId: "p2" }),
    ];

    it("sums settled spend plus in-flight claims", () => {
        expect(consumedUnits(mixed)).toBe(1_050);
    });

    // The bug this whole field exists to prevent: without alreadyUsedToday the
    // guard judges each dispatch against an empty day and leaks paid units.
    it("makes the guard respect what the day has already spent", () => {
        const naive = planEngineBudget({ engineId: "gemini", requestedSamples: 600 });
        expect(naive.reason).toBe("within_free_allowance");

        const informed = planEngineBudget(
            { engineId: "gemini", requestedSamples: 600 },
            { alreadyUsedToday: consumedUnits(mixed) }
        );
        expect(informed.reason).toBe("deferred_to_protect_allowance");
        expect(informed.allowed).toBe(450); // 1,500 free - 1,050 consumed
        expect(informed.billableUnits).toBe(0);
    });

    it("bills only past the remaining allowance when authorised", () => {
        const o = planEngineBudget(
            { engineId: "gemini", requestedSamples: 600 },
            { alreadyUsedToday: 1_350, overageAuthorised: true }
        );
        expect(o.billableUnits).toBe(450); // 150 free left, 450 charged
        expect(o.costMicroUsd).toBe(450 * 35_000);
    });

    it("treats an exhausted day as zero remaining, not negative", () => {
        const o = planEngineBudget(
            { engineId: "gemini", requestedSamples: 500 },
            { alreadyUsedToday: 25_000 }
        );
        expect(o.allowed).toBe(0);
        expect(o.deferred).toBe(500);
        expect(o.billableUnits).toBe(0);
    });

    it("totals settled cost across a day", () => {
        expect(settledCostMicroUsd(mixed)).toBe(0);
    });
});

describe("the engine consumes more than was reserved", () => {
    /**
     * costUnits is adapter-reported and only floored at zero, so a vendor can
     * report more than we pessimistically claimed. The claim is a ceiling on
     * what we AUTHORISED, not on what the vendor did.
     */
    const over = settleReservation(
        openReservation({ ...base, units: 100 }),
        [ok(140)],
        { billableUnits: 0, costMicroUsd: 0 },
        AT
    );

    it("splits the excess off instead of exceeding the claim", () => {
        // settled_units <= reserved_units is enforced in the database too; a
        // row folding all 140 into settledUnits would simply be rejected.
        expect(over.settledUnits).toBe(100);
        expect(over.overrunUnits).toBe(40);
    });

    it("still counts every consumed unit against the day", () => {
        // The whole point. Reporting 100 would tell the guard 40 units of the
        // bucket are still available when they are already gone — the
        // self-amplifying undercount the ledger exists to prevent.
        expect(consumedUnits([over])).toBe(140);
    });

    it("records nothing beyond the claim when the engine stays inside it", () => {
        const within = settleReservation(
            openReservation({ ...base, units: 100 }),
            [ok(60)],
            { billableUnits: 0, costMicroUsd: 0 },
            AT
        );
        expect(within.settledUnits).toBe(60);
        expect(within.overrunUnits).toBe(0);
        expect(consumedUnits([within])).toBe(60);
    });
});
