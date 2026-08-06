import type { AnswerEngineId, EngineLocale, EngineSampleResult } from "../engines/engine-types";

/**
 * E-7 ports. Orchestration talks to these, never to Supabase directly, so the
 * dispatch path can be exercised against in-memory doubles before either
 * deferred migration is applied — and so a crash test can assert on real state
 * transitions rather than mocks of them.
 */

/** Mirrors the outcomes of the aeo_reserve_quota SQL function. */
export type ReserveOutcome =
    /** New reservation, full request granted. */
    | { kind: "granted"; reservationId: string; grantedUnits: number; billableUnits: number }
    /** New reservation, but clipped to what was left of the free allowance. */
    | { kind: "partial"; reservationId: string; grantedUnits: number; deferredUnits: number }
    /** Nothing left to grant; no row written. */
    | { kind: "deferred"; deferredUnits: number }
    /**
     * This idempotency key already has a reservation. Returned on an Inngest step
     * retry — the decisive signal that we must not open a second one.
     */
    | {
          kind: "existing";
          reservationId: string;
          grantedUnits: number;
          dispatchedAt: string | null;
          /**
           * The reservation already reached a terminal state, so this unit is
           * finished. The caller MUST NOT call the engine again: a re-delivered
           * event would otherwise pay the vendor a second time for work whose
           * result is already stored, and then fail trying to settle a closed
           * reservation. Distinct from a mid-flight retry, where the reservation
           * is still open and the work genuinely does need finishing.
           */
          alreadySettled: boolean;
      };

export type ReserveRequest = {
    idempotencyKey: string;
    organizationId: string;
    engineId: AnswerEngineId;
    usageDate: string;
    requestedUnits: number;
    freePerDay: number;
    overageAuthorised: boolean;
    runId: string;
};

export interface ReservationStore {
    /**
     * Atomic check-and-insert. The allowance decision and the write happen under
     * one lock, because a pure in-process check cannot serialize concurrent
     * dispatches: two workers would both read the same remaining balance and both
     * proceed.
     */
    reserve(request: ReserveRequest): Promise<ReserveOutcome>;

    /**
     * Stamp the moment just before the engine is called, and count the attempt.
     *
     * A crash inside the call step re-runs that step, and we cannot know whether
     * the first request was billed. This makes the second attempt visible in the
     * ledger instead of silent — `dispatchAttempts > 1` means a duplicate charge
     * is possible for that reservation.
     */
    markDispatched(reservationId: string, at: string): Promise<{ dispatchAttempts: number }>;

    /**
     * `overrunUnits` is consumption the engine reported beyond the claim. It is
     * carried separately rather than folded into `settledUnits` so the database
     * can keep enforcing settled <= reserved, and so a row whose cost figure is
     * only a floor is identifiable later.
     */
    settle(
        reservationId: string,
        settlement: {
            settledUnits: number;
            overrunUnits: number;
            billableUnits: number;
            costMicroUsd: number;
            at: string;
        }
    ): Promise<void>;

    release(reservationId: string, at: string): Promise<void>;
}

export type RunStatus = "running" | "success" | "partial" | "failed" | "deferred";

export interface RunStore {
    /** Active prompts only. A `suggested` prompt is inert until a human enables it. */
    loadActivePrompts(businessId: string): Promise<
        { promptId: string; promptText: string; locale: EngineLocale }[]
    >;

    /**
     * Units already consumed today per engine, read from settled + in-flight
     * reservations. Feeds the planner's projection only — the binding decision
     * is made per unit inside aeo_reserve_quota.
     */
    consumedTodayByEngine(
        organizationId: string,
        usageDate: string
    ): Promise<Partial<Record<AnswerEngineId, number>>>;

    createRun(input: {
        businessId: string;
        trigger: "scheduled" | "manual" | "backfill";
        scheduledFor: string | null;
    }): Promise<{ runId: string }>;

    completeRun(
        runId: string,
        outcome: { status: RunStatus; errorMessage: string | null; at: string }
    ): Promise<void>;
}

export interface SampleStore {
    /** Idempotent on (runId, promptId, engineId, attempt). */
    persist(input: {
        runId: string;
        businessId: string;
        promptId: string;
        engineId: AnswerEngineId;
        attempt: number;
        result: EngineSampleResult;
    }): Promise<{ sampleId: string; alreadyPersisted: boolean }>;
}

/**
 * The subset of Inngest's `step.run` that orchestration depends on.
 *
 * Contract, which the tests reproduce exactly: a step that COMPLETES is
 * memoized and replayed on retry without re-executing; a step that throws or
 * dies mid-flight is re-executed from scratch. Everything E-7 does about crash
 * safety follows from those two sentences.
 */
export type StepRunner = <T>(stepId: string, fn: () => Promise<T>) => Promise<T>;
