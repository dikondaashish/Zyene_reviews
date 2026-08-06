import type { AnswerEngineAdapter, AnswerEngineId, EngineLocale } from "../engines/engine-types";
import { billableUnits } from "../engines/engine-types";
import { getEngineDescriptor } from "../engines/engine-catalog";
import type { ReservationStore, SampleStore, StepRunner } from "./ports";

/**
 * E-7: one unit of sampling work — a single (prompt × engine × attempt).
 *
 * Three separate steps, deliberately. Inngest memoizes a step that COMPLETES
 * and re-runs one that dies mid-flight, so where the boundaries fall decides
 * what a crash costs:
 *
 *   reserve | call | settle   a crash after the call replays only `settle`;
 *                             the engine is not called again.
 *   reserve+call | settle     a crash after the call replays the call too, and
 *                             the vendor charges twice.
 *
 * The second shape is the obvious-looking one — fewer round trips, one step for
 * "do the work" — and it is wrong for exactly this reason.
 */

export type DispatchInput = {
    runId: string;
    businessId: string;
    organizationId: string;
    promptId: string;
    promptText: string;
    engineId: AnswerEngineId;
    attempt: number;
    locale: EngineLocale;
    usageDate: string;
    overageAuthorised: boolean;
    /** Units this dispatch expects to consume. One sample per call today. */
    requestedUnits: number;
};

export type DispatchOutcome =
    | {
          kind: "sampled";
          sampleId: string;
          billableUnits: number;
          costMicroUsd: number;
          duplicateRisk: boolean;
          /** Consumption beyond the claim. Non-zero means costMicroUsd is a floor. */
          overrunUnits: number;
      }
    | { kind: "deferred"; deferredUnits: number }
    | { kind: "skipped"; reason: string };

export type DispatchDeps = {
    step: StepRunner;
    adapter: AnswerEngineAdapter;
    reservations: ReservationStore;
    samples: SampleStore;
    now?: () => Date;
};

export async function dispatchUnit(
    input: DispatchInput,
    deps: DispatchDeps
): Promise<DispatchOutcome> {
    const { step, adapter, reservations, samples } = deps;
    const now = deps.now ?? (() => new Date());
    const descriptor = getEngineDescriptor(input.engineId);
    const idempotencyKey = `${input.runId}:${input.promptId}:${input.engineId}:${input.attempt}`;

    // STEP 1 — claim before spending. Atomic in the database: the allowance
    // decision and the row are written under one lock, so concurrent dispatches
    // cannot both consume the same remaining balance.
    const reservation = await step("reserve", async () =>
        reservations.reserve({
            idempotencyKey,
            organizationId: input.organizationId,
            engineId: input.engineId,
            usageDate: input.usageDate,
            requestedUnits: input.requestedUnits,
            freePerDay: descriptor.cost.freePerDay,
            overageAuthorised: input.overageAuthorised,
            runId: input.runId,
        })
    );

    if (reservation.kind === "deferred") {
        return { kind: "deferred", deferredUnits: reservation.deferredUnits };
    }

    // A closed reservation means this exact unit already ran to completion. Its
    // sample is stored and its units are accounted for, so there is nothing left
    // to do — and calling the engine again would pay the vendor a second time
    // for an answer we already have, then fail trying to settle a closed row.
    //
    // This is NOT the mid-flight retry case: there the reservation is still
    // `reserved`, and the work genuinely does need finishing.
    if (reservation.kind === "existing" && reservation.alreadySettled) {
        return { kind: "skipped", reason: "already_settled" };
    }

    const reservationId = reservation.reservationId;

    // STEP 2 — mark intent, then call, INSIDE ONE STEP.
    //
    // The marker deliberately is not its own step. A completed step is memoized
    // and replayed, so a separate `mark-dispatched` step would return
    // dispatchAttempts = 1 forever and the duplicate it exists to reveal would
    // stay invisible. Inside the call step the increment is a real database
    // write that happens again each time the step re-executes, which is exactly
    // the signal we want: attempts > 1 means a request may already have gone out
    // and been billed without us seeing its response.
    //
    // This step is still separate from `settle` below, so a crash after the call
    // replays only settlement and never re-calls the engine.
    const called = await step("call-engine", async () => {
        const dispatch = await reservations.markDispatched(reservationId, now().toISOString());
        const sample = await adapter.sample({
            prompt: input.promptText,
            locale: input.locale,
            attempt: input.attempt,
        });
        return { sample, dispatchAttempts: dispatch.dispatchAttempts };
    });

    const result = called.sample;
    const duplicateRisk = called.dispatchAttempts > 1;

    // STEP 3 — reconcile. Consumption and cost are different quantities: a call
    // inside a free allowance consumes a unit and costs nothing.
    //
    // costUnits is adapter-reported and unbounded above, so it can exceed what
    // we pessimistically claimed. The excess is split off rather than dropped:
    // discarding it would tell the guard the bucket is less drained than it is,
    // which is the self-amplifying undercount this ledger exists to prevent.
    const consumed = billableUnits(result);
    const settledUnits = Math.min(consumed, reservation.grantedUnits);
    const overrunUnits = consumed - settledUnits;
    const billed = reservation.kind === "granted" ? Math.min(reservation.billableUnits, consumed) : 0;

    const persisted = await step("persist-sample", async () =>
        samples.persist({
            runId: input.runId,
            businessId: input.businessId,
            promptId: input.promptId,
            engineId: input.engineId,
            attempt: input.attempt,
            result,
        })
    );

    await step("settle", async () =>
        reservations.settle(reservationId, {
            settledUnits,
            overrunUnits,
            billableUnits: billed,
            costMicroUsd: billed > 0 ? billed * descriptor.cost.overageMicroUsd : 0,
            at: now().toISOString(),
        })
    );

    return {
        kind: "sampled",
        sampleId: persisted.sampleId,
        billableUnits: billed,
        costMicroUsd: billed > 0 ? billed * descriptor.cost.overageMicroUsd : 0,
        duplicateRisk,
        overrunUnits,
    };
}
