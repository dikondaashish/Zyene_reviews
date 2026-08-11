import { describe, expect, it } from "vitest";

import { dispatchUnit, type DispatchInput } from "../../src/services/aeo/orchestration/dispatch-unit";
import type {
    AnswerStore,
    AnswerStorePut,
    BillingGateway,
    ReservationStore,
    ReserveOutcome,
    ReserveRequest,
    SampleStore,
    StepRunner,
} from "../../src/services/aeo/orchestration/ports";
import { FixtureEngineAdapter } from "../../src/services/aeo/engines/adapters/fixture-engine-adapter";
import type { AnswerEngineAdapter } from "../../src/services/aeo/engines/engine-types";
import {
    citationsUnavailable,
    engineError,
    failedSample,
    okSample,
} from "../../src/services/aeo/engines/engine-result";

/**
 * Reproduces Inngest's `step.run` contract so crash behaviour can be asserted
 * rather than reasoned about:
 *
 *   - a step that COMPLETES is memoized and replayed on retry, not re-executed
 *   - a step that dies mid-flight is re-executed from scratch on retry
 *
 * `crashBefore` models dying before the side effect. `crashAfter` models the
 * dangerous case: the side effect happened — the vendor was called — and the
 * process died before the result was durable, so the step will run again.
 */
class FakeInngest {
    private memo = new Map<string, unknown>();
    attempt = 0;
    executed: string[] = [];
    crashBefore?: { stepId: string; onAttempt: number };
    crashAfter?: { stepId: string; onAttempt: number };
    /** Fails this step on every attempt — models a run that never recovers. */
    crashAlways?: string;

    private step(): StepRunner {
        return async <T>(stepId: string, fn: () => Promise<T>): Promise<T> => {
            if (this.memo.has(stepId)) return this.memo.get(stepId) as T;
            this.executed.push(`${this.attempt}:${stepId}`);

            if (this.crashAlways === stepId) {
                throw new Error(`crash always in ${stepId}`);
            }
            if (this.crashBefore?.stepId === stepId && this.crashBefore.onAttempt === this.attempt) {
                throw new Error(`crash before ${stepId}`);
            }
            const out = await fn();
            if (this.crashAfter?.stepId === stepId && this.crashAfter.onAttempt === this.attempt) {
                // Side effect done, result never persisted: the step re-runs.
                throw new Error(`crash after ${stepId}`);
            }
            this.memo.set(stepId, out);
            return out;
        };
    }

    async run<T>(body: (step: StepRunner) => Promise<T>, maxAttempts = 4): Promise<T> {
        let last: unknown;
        for (let i = 1; i <= maxAttempts; i += 1) {
            this.attempt = i;
            try {
                return await body(this.step());
            } catch (error) {
                last = error;
            }
        }
        throw last;
    }
}

/** In-memory stand-in for aeo_reserve_quota + the reservations table. */
class MemoryReservations implements ReservationStore {
    rows = new Map<string, {
        id: string; key: string; units: number; state: string;
        dispatchAttempts: number; settledUnits: number; overrunUnits: number;
        billableUnits: number; costMicroUsd: number;
    }>();
    private seq = 0;

    async reserve(req: ReserveRequest): Promise<ReserveOutcome> {
        const existing = [...this.rows.values()].find((r) => r.key === req.idempotencyKey);
        if (existing) {
            return {
                kind: "existing",
                reservationId: existing.id,
                grantedUnits: existing.units,
                dispatchedAt: existing.dispatchAttempts > 0 ? "recorded" : null,
                alreadySettled: existing.state !== "reserved",
            };
        }
        const consumed = [...this.rows.values()].reduce(
            (s, r) => s + (r.state === "reserved" ? r.units : r.settledUnits + r.overrunUnits),
            0
        );
        const remaining = req.freePerDay <= 0 ? req.requestedUnits : Math.max(0, req.freePerDay - consumed);
        const grant = Math.min(req.requestedUnits, remaining);
        if (grant <= 0) return { kind: "deferred", deferredUnits: req.requestedUnits };

        const id = `res-${++this.seq}`;
        this.rows.set(id, {
            id, key: req.idempotencyKey, units: grant, state: "reserved",
            dispatchAttempts: 0, settledUnits: 0, overrunUnits: 0, billableUnits: 0, costMicroUsd: 0,
        });
        return grant < req.requestedUnits
            ? { kind: "partial", reservationId: id, grantedUnits: grant, deferredUnits: req.requestedUnits - grant }
            : { kind: "granted", reservationId: id, grantedUnits: grant, billableUnits: req.freePerDay <= 0 ? grant : 0 };
    }

    async markDispatched(id: string) {
        const row = this.rows.get(id)!;
        row.dispatchAttempts += 1;
        return { dispatchAttempts: row.dispatchAttempts };
    }

    async settle(
        id: string,
        s: { settledUnits: number; overrunUnits: number; billableUnits: number; costMicroUsd: number }
    ) {
        const row = this.rows.get(id)!;
        // Restates the table's CHECK constraints, so a settlement the database
        // would reject fails here too rather than passing in memory and blowing
        // up only once the migration is applied.
        if (s.settledUnits > row.units) throw new Error("settled_units > reserved_units");
        if (s.overrunUnits > 0 && s.settledUnits !== row.units) {
            throw new Error("overrun without a fully consumed claim");
        }
        if (s.billableUnits > s.settledUnits + s.overrunUnits) {
            throw new Error("billable_units > total consumption");
        }
        // aeo_quota_reservations_cost_requires_billable_units. Omitting this one
        // is what let a paid engine settle 1 billable unit at zero cost through
        // the whole suite and fail only against the real table, mid-run, with
        // the vendor already called.
        if ((s.billableUnits === 0) !== (s.costMicroUsd === 0)) {
            throw new Error(
                `cost_requires_billable_units: billable=${s.billableUnits} cost=${s.costMicroUsd}`
            );
        }
        row.state = "settled";
        row.settledUnits = s.settledUnits;
        row.overrunUnits = s.overrunUnits;
        row.billableUnits = s.billableUnits;
        row.costMicroUsd = s.costMicroUsd;
    }

    async release(id: string) {
        this.rows.get(id)!.state = "released";
    }
}

class MemorySamples implements SampleStore {
    persisted: string[] = [];
    /** What the row recorded as its evidence pointer, keyed by unit. */
    paths = new Map<string, string | null>();
    async persist(input: {
        runId: string;
        promptId: string;
        engineId: string;
        attempt: number;
        answerStoragePath: string | null;
    }) {
        const key = `${input.runId}:${input.promptId}:${input.engineId}:${input.attempt}`;
        const already = this.persisted.includes(key);
        if (!already) {
            this.persisted.push(key);
            this.paths.set(key, input.answerStoragePath);
        }
        return { sampleId: key, alreadyPersisted: already };
    }
}

/** E-8 double. `fail` models object storage being down while the DB is fine. */
class MemoryAnswers implements AnswerStore {
    objects = new Map<string, string>();
    fail = false;
    async put(input: AnswerStorePut): Promise<string | null> {
        if (input.result.status !== "ok") return null;
        if (this.fail) return null;
        const path = `${input.organizationId}/${input.runId}/${input.promptId}__${input.engineId}__${input.attempt}.json`;
        this.objects.set(path, JSON.stringify({
            prompt: input.promptText,
            answerText: input.result.answerText,
        }));
        return path;
    }
}

/**
 * E-9 double. Records every call rather than deciding anything itself — the
 * real flag-gating (isMeteredBillingLive) lives in SupabaseBillingGateway and
 * is tested there; this fake exists so dispatch-unit's crash tests can assert
 * WHETHER and HOW OFTEN billing was called without needing a live database.
 */
class MemoryBilling implements BillingGateway {
    calls: { organizationId: string; sampleId: string }[] = [];
    async settleTest(input: { organizationId: string; sampleId: string }): Promise<void> {
        this.calls.push(input);
    }
}

const INPUT: DispatchInput = {
    runId: "run-1",
    businessId: "biz-1",
    organizationId: "org-1",
    promptId: "prompt-1",
    promptText: "best plumber in Austin",
    engineId: "gemini",
    attempt: 1,
    locale: { country: "US", language: "en" },
    usageDate: "2026-08-06",
    overageAuthorised: false,
    requestedUnits: 1,
};

function harness() {
    const inngest = new FakeInngest();
    const adapter = new FixtureEngineAdapter({ id: "gemini", modelId: "gemini-2.5-pro" });
    const reservations = new MemoryReservations();
    const samples = new MemorySamples();
    const answers = new MemoryAnswers();
    const billing = new MemoryBilling();
    const go = () =>
        inngest.run((step) => dispatchUnit(INPUT, { step, adapter, reservations, samples, answers, billing }));
    return { inngest, adapter, reservations, samples, answers, billing, go };
}

describe("happy path", () => {
    it("calls the engine once and settles the reservation", async () => {
        const h = harness();
        const out = await h.go();
        expect(out.kind).toBe("sampled");
        expect(h.adapter.calls).toHaveLength(1);
        expect([...h.reservations.rows.values()][0].state).toBe("settled");
    });

    it("reserves before calling — never the other way round", async () => {
        const h = harness();
        await h.go();
        expect(h.inngest.executed.map((s) => s.split(":")[1])).toEqual([
            "reserve",
            "call-engine",
            "persist-sample",
            "settle",
            // E-9: only for a status "ok" sample — vendor cost settles first,
            // since it is owed regardless of what we bill the customer.
            "bill-test",
        ]);
    });

    it("bills the org for a status ok sample, exactly once", async () => {
        const h = harness();
        await h.go();
        expect(h.billing.calls).toEqual([{ organizationId: "org-1", sampleId: expect.any(String) }]);
    });
});

describe("crash during reserve", () => {
    it("retries to exactly one reservation, never two", async () => {
        const h = harness();
        h.inngest.crashBefore = { stepId: "reserve", onAttempt: 1 };
        const out = await h.go();
        expect(out.kind).toBe("sampled");
        expect(h.reservations.rows.size).toBe(1);
        expect(h.adapter.calls).toHaveLength(1);
    });

    it("does not call the engine when the reserve step never completed", async () => {
        const h = harness();
        h.inngest.crashAfter = { stepId: "reserve", onAttempt: 1 };
        await h.go();
        // The reserve step ran twice, but the idempotency key made the second a
        // lookup rather than a second claim.
        expect(h.reservations.rows.size).toBe(1);
    });
});

describe("crash after the engine was called", () => {
    /**
     * The case that decides whether splitting `call-engine` from `settle` was
     * worth it. The call completed and was memoized; the retry must replay it
     * rather than pay for it again.
     */
    it("replays the memoized call instead of re-calling the vendor", async () => {
        const h = harness();
        h.inngest.crashBefore = { stepId: "settle", onAttempt: 1 };
        const out = await h.go();
        expect(out.kind).toBe("sampled");
        expect(h.adapter.calls).toHaveLength(1);
        expect([...h.reservations.rows.values()][0].state).toBe("settled");
    });

    it("does not persist the sample twice", async () => {
        const h = harness();
        h.inngest.crashBefore = { stepId: "settle", onAttempt: 1 };
        await h.go();
        expect(h.samples.persisted).toHaveLength(1);
    });
});

describe("crash inside the call step, after the request went out", () => {
    /**
     * Unavoidable: the vendor may already have billed us and we never saw the
     * response. Ordering cannot fix it, so the requirement is that the retry is
     * VISIBLE rather than silent.
     */
    it("re-calls the engine and flags the duplicate risk", async () => {
        const h = harness();
        h.inngest.crashAfter = { stepId: "call-engine", onAttempt: 1 };
        const out = await h.go();

        expect(h.adapter.calls).toHaveLength(2);
        expect(out.kind).toBe("sampled");
        if (out.kind === "sampled") expect(out.duplicateRisk).toBe(true);
    });

    it("records both dispatch attempts on the reservation", async () => {
        const h = harness();
        h.inngest.crashAfter = { stepId: "call-engine", onAttempt: 1 };
        await h.go();
        // Would be 1 if the marker were its own memoized step, hiding the duplicate.
        expect([...h.reservations.rows.values()][0].dispatchAttempts).toBe(2);
    });

    it("reports no duplicate risk on a clean run", async () => {
        const h = harness();
        const out = await h.go();
        if (out.kind === "sampled") expect(out.duplicateRisk).toBe(false);
    });
});

describe("permanent failure leaves a recoverable state", () => {
    it("leaves the reservation open and unsettled for the sweeper, never half-settled", async () => {
        const h = harness();
        h.inngest.crashAlways = "call-engine";

        await expect(h.go()).rejects.toThrow(/crash always/);

        // Claimed but never settled: the units stay committed until the TTL
        // sweeper expires them. Conservative, and recoverable — the alternative
        // is a row that says spend happened when it did not, or nothing at all.
        const row = [...h.reservations.rows.values()][0];
        expect(row.state).toBe("reserved");
        expect(row.settledUnits).toBe(0);
        expect(row.billableUnits).toBe(0);
        expect(row.costMicroUsd).toBe(0);
    });

    it("persists no sample for work that never produced a result", async () => {
        const h = harness();
        h.inngest.crashAlways = "call-engine";
        await expect(h.go()).rejects.toThrow();
        expect(h.samples.persisted).toHaveLength(0);
    });

    it("records no dispatch when the step died before reaching the engine", async () => {
        const h = harness();
        h.inngest.crashAlways = "call-engine";
        await expect(h.go()).rejects.toThrow();
        // The step never entered its body, so markDispatched never ran. Zero
        // attempts is the cleanest recovery state there is: nothing was sent,
        // nothing can have been billed, and the sweeper simply returns the units.
        expect([...h.reservations.rows.values()][0].dispatchAttempts).toBe(0);
        expect(h.adapter.calls).toHaveLength(0);
    });
});

describe("a re-delivered event for finished work", () => {
    /**
     * Found by the end-to-end smoke test against the real schema, not by
     * reasoning: an Inngest event can be re-delivered or replayed by hand after
     * its function already completed. The reservation then comes back
     * `existing` AND terminal.
     *
     * Treating that like a fresh grant calls the vendor a SECOND time for an
     * answer already stored, and then throws settling a closed reservation —
     * money spent plus a failure. The unit is finished; the only correct action
     * is to do nothing.
     *
     * Distinct from a mid-flight retry, where the reservation is still open and
     * the work does need finishing. The state, not the mere existence of the
     * row, is what separates them.
     */
    async function runTwice() {
        const adapter = new FixtureEngineAdapter({ id: "gemini", modelId: "gemini-2.5-pro" });
        const reservations = new MemoryReservations();
        const samples = new MemorySamples();
        const answers = new MemoryAnswers();
        const billing = new MemoryBilling();
        const once = () =>
            new FakeInngest().run((step) =>
                dispatchUnit(INPUT, { step, adapter, reservations, samples, answers, billing })
            );
        const first = await once();
        const second = await once();
        return { first, second, adapter, reservations, samples };
    }

    it("does not call the engine again", async () => {
        const { adapter } = await runTwice();
        expect(adapter.calls).toHaveLength(1);
    });

    it("reports the unit as already settled rather than throwing", async () => {
        const { first, second } = await runTwice();
        expect(first.kind).toBe("sampled");
        expect(second).toEqual({ kind: "skipped", reason: "already_settled" });
    });

    it("leaves exactly one reservation and one sample", async () => {
        const { reservations, samples } = await runTwice();
        expect(reservations.rows.size).toBe(1);
        expect(samples.persisted).toHaveLength(1);
    });

    it("does not settle the reservation twice", async () => {
        const { reservations } = await runTwice();
        const row = [...reservations.rows.values()][0];
        expect(row.state).toBe("settled");
        expect(row.settledUnits).toBe(0); // fixture consumes nothing
        expect(row.costMicroUsd).toBe(0);
    });
});

describe("the engine reports more units than were reserved", () => {
    /**
     * costUnits is adapter-reported and only floored at zero, so a vendor can
     * charge more than we pessimistically claimed. Folding the excess into
     * settled_units would violate settled <= reserved: the settle step would
     * fail, retry forever, and the sweeper would expire the row — recording
     * ZERO consumption for units that really did drain the bucket. That is the
     * self-amplifying undercount the ledger exists to prevent, so the excess is
     * recorded as an overrun instead.
     */
    const overReporting = (units: number): AnswerEngineAdapter => ({
        id: "gemini",
        modelId: "gemini-2.5-pro",
        isConfigured: () => true,
        sample: async () =>
            okSample({
                modelId: "gemini-2.5-pro",
                answerText: "an answer",
                citations: citationsUnavailable(),
                latencyMs: 10,
                costUnits: units,
            }),
    });

    function overrunHarness(units: number) {
        const inngest = new FakeInngest();
        const reservations = new MemoryReservations();
        const samples = new MemorySamples();
        const answers = new MemoryAnswers();
        const billing = new MemoryBilling();
        const adapter = overReporting(units);
        return {
            reservations,
            go: () =>
                inngest.run((step) =>
                    dispatchUnit(INPUT, { step, adapter, reservations, samples, answers, billing })
                ),
        };
    }

    it("settles up to the claim and records the excess rather than dropping it", async () => {
        const h = overrunHarness(3); // claimed 1, vendor reports 3
        const out = await h.go();

        expect(out.kind).toBe("sampled");
        if (out.kind === "sampled") expect(out.overrunUnits).toBe(2);

        const row = [...h.reservations.rows.values()][0];
        expect(row.state).toBe("settled");
        expect(row.settledUnits).toBe(1);
        expect(row.overrunUnits).toBe(2);
    });

    it("counts the overrun against the day, so the next reservation sees it", async () => {
        const h = overrunHarness(3);
        await h.go();

        // 3 units really went, not 1. A guard reading only settled_units would
        // believe 9,999 remain and authorise spend that is already gone.
        const next = await h.reservations.reserve({
            idempotencyKey: "next",
            organizationId: "org-1",
            engineId: "gemini",
            usageDate: "2026-08-06",
            requestedUnits: 9_999,
            freePerDay: 10_000,
            overageAuthorised: false,
            runId: "run-2",
        });
        expect(next.kind).toBe("partial");
        if (next.kind === "partial") expect(next.grantedUnits).toBe(9_997);
    });

    it("records no overrun when the engine stays within its claim", async () => {
        const h = overrunHarness(1);
        const out = await h.go();
        if (out.kind === "sampled") expect(out.overrunUnits).toBe(0);
        expect([...h.reservations.rows.values()][0].overrunUnits).toBe(0);
    });
});

describe("E-8 — the answer is kept as evidence", () => {
    it("records where the answer was stored", async () => {
        const h = harness();
        await h.go();
        const [key] = h.samples.persisted;
        expect(h.samples.paths.get(key)).toMatch(/^org-1\/run-1\/prompt-1__gemini__1\.json$/);
        expect(h.answers.objects.size).toBe(1);
    });

    it("stores the prompt with the answer, since half the evidence is the question", async () => {
        const h = harness();
        await h.go();
        const stored = JSON.parse([...h.answers.objects.values()][0]) as { prompt: string };
        expect(stored.prompt).toBe("best plumber in Austin");
    });

    it("keeps the sample when storage fails, and records no evidence rather than an empty answer", async () => {
        // Losing the copy must not lose the observation: the vendor was already
        // paid for it. NULL then means "no evidence retained" — which readers
        // must distinguish from "the engine said nothing".
        const h = harness();
        h.answers.fail = true;
        const out = await h.go();

        expect(out.kind).toBe("sampled");
        expect(h.samples.persisted).toHaveLength(1);
        expect(h.samples.paths.get(h.samples.persisted[0])).toBeNull();
    });

    it("writes one object per unit however often the step replays", async () => {
        // The path is derived from the unit, not from the sample id, so a
        // re-executed step overwrites its own object instead of orphaning one.
        const h = harness();
        h.inngest.crashAfter = { stepId: "persist-sample", onAttempt: 1 };
        await h.go();
        expect(h.answers.objects.size).toBe(1);
        expect(h.samples.persisted).toHaveLength(1);
    });
});

describe("a vendor that charges nothing for a call it answered", () => {
    /**
     * Regression, found by the first real DataForSEO run rather than by this
     * suite. DataForSEO rejected a malformed task, still replied on the wire —
     * so the request counted as one consumed unit — and reported `cost: 0`.
     *
     * `google_serp` has no free allowance, so the reservation claimed 1 billable
     * unit. Reading the reported cost through `??` treated the 0 as "no figure
     * given", left the claim at 1, and produced billable=1 / cost=0: a row the
     * ledger's CHECK constraint refuses. The settle threw, the run aborted with
     * 19 of 25 units undispatched, and the reservation stayed `reserved` with
     * the vendor already called.
     */
    class ZeroCostAdapter implements AnswerEngineAdapter {
        readonly id = "google_serp" as const;
        readonly modelId = "dataforseo/google-serp";
        isConfigured() {
            return true;
        }
        async sample() {
            return failedSample({
                modelId: this.modelId,
                error: engineError("invalid_request", "40501: Invalid Field: 'location_name'."),
                latencyMs: 697,
                // The request left and came back, so a unit was consumed...
                costUnits: 1,
                // ...but DataForSEO billed nothing for rejecting it.
                reportedCostMicroUsd: 0,
            });
        }
    }

    const PAID: DispatchInput = { ...INPUT, engineId: "google_serp" };

    function paidHarness() {
        const inngest = new FakeInngest();
        const adapter = new ZeroCostAdapter();
        const reservations = new MemoryReservations();
        const samples = new MemorySamples();
        const answers = new MemoryAnswers();
        const billing = new MemoryBilling();
        return {
            reservations,
            billing,
            go: () =>
                inngest.run((step) =>
                    dispatchUnit(PAID, { step, adapter, reservations, samples, answers, billing })
                ),
        };
    }

    it("settles instead of throwing, so the rest of the run still dispatches", async () => {
        const h = paidHarness();
        const out = await h.go();
        expect(out.kind).toBe("sampled");
    });

    it("never bills the customer for a call the vendor billed us for but that answered nothing", async () => {
        // This IS the confirmed "one test" definition (2026-08-08): only
        // status "ok" is a billable test. DataForSEO charging us for a
        // rejected request is our cost to absorb, never passed through.
        const h = paidHarness();
        await h.go();
        expect(h.billing.calls).toEqual([]);
    });

    it("bills nothing and leaves no reservation open", async () => {
        const h = paidHarness();
        await h.go();
        const row = [...h.reservations.rows.values()][0];
        expect(row.state).toBe("settled");
        expect(row.billableUnits).toBe(0);
        expect(row.costMicroUsd).toBe(0);
    });

    it("still counts the unit as consumed — quota was used even though money was not", async () => {
        const h = paidHarness();
        await h.go();
        expect([...h.reservations.rows.values()][0].settledUnits).toBe(1);
    });

    it("does not silently substitute the catalog rate for a reported zero", async () => {
        const h = paidHarness();
        const out = await h.go();
        // The catalog rate for google_serp is non-zero; charging it here would
        // invent an invoice the vendor never sent.
        expect(out.kind === "sampled" && out.costMicroUsd).toBe(0);
    });
});

describe("deferral", () => {
    it("never calls the engine when the allowance is exhausted", async () => {
        const h = harness();
        // Fill the day so nothing is left to grant.
        await h.reservations.reserve({
            idempotencyKey: "filler",
            organizationId: "org-1",
            engineId: "gemini",
            usageDate: "2026-08-06",
            requestedUnits: 10_000,
            freePerDay: 10_000,
            overageAuthorised: false,
            runId: "run-0",
        });

        const out = await h.go();
        expect(out.kind).toBe("deferred");
        expect(h.adapter.calls).toHaveLength(0);
        expect(h.samples.persisted).toHaveLength(0);
    });
});
