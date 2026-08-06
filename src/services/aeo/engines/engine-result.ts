import type {
    EngineCitation,
    EngineCitations,
    EngineError,
    EngineSampleFailed,
    EngineSampleNoAnswer,
    EngineSampleOk,
} from "./engine-types";

/**
 * Constructors for engine sample results. Adapters build results through these
 * rather than by object literal, so the invariants live in one place: a sample
 * that reached a model always carries a model id, timestamps are always ISO-8601,
 * and cost can never go negative.
 */

function nowIso(): string {
    return new Date().toISOString();
}

function requireModelId(modelId: string): string {
    const trimmed = modelId.trim();
    if (!trimmed) {
        // QA criterion #1: a stored sample with no model id makes its trend line
        // uninterpretable later, when the underlying model has been swapped.
        throw new Error("Engine sample requires a non-empty modelId");
    }
    return trimmed;
}

function normalizeCost(costUnits: number): number {
    return Number.isFinite(costUnits) && costUnits > 0 ? costUnits : 0;
}

/**
 * Vendor-reported cost, kept distinct from "not reported".
 *
 * A non-finite or negative figure is dropped entirely rather than clamped to 0,
 * because 0 means "the vendor told us this was free" and the ledger treats that
 * as authoritative. Silently turning a garbled value into a free call would
 * understate spend — the direction this whole design refuses to fail in.
 */
function normalizeReportedCost(value: number | undefined): { reportedCostMicroUsd?: number } {
    if (value === undefined) return {};
    if (!Number.isFinite(value) || value < 0) return {};
    return { reportedCostMicroUsd: Math.round(value) };
}

/** Ordinals are assigned here so no adapter can emit a 0-based or duplicated list. */
export function citationsPresent(items: ReadonlyArray<{ url: string; title?: string | null }>): EngineCitations {
    const normalized: EngineCitation[] = items.map((item, index) => ({
        url: item.url,
        title: item.title?.trim() || null,
        ordinal: index + 1,
    }));
    return { availability: "present", items: normalized };
}

/** For engines that expose no sources at all. Not the same as an empty list. */
export function citationsUnavailable(): EngineCitations {
    return { availability: "unavailable", items: [] };
}

export function okSample(input: {
    modelId: string;
    answerText: string;
    citations: EngineCitations;
    latencyMs: number;
    costUnits: number;
    reportedCostMicroUsd?: number;
}): EngineSampleOk {
    return {
        status: "ok",
        modelId: requireModelId(input.modelId),
        answerText: input.answerText,
        citations: input.citations,
        sampledAt: nowIso(),
        latencyMs: Math.max(0, input.latencyMs),
        costUnits: normalizeCost(input.costUnits),
        ...normalizeReportedCost(input.reportedCostMicroUsd),
    };
}

export function noAnswerSample(input: {
    modelId: string;
    reason: string;
    latencyMs: number;
    costUnits: number;
    reportedCostMicroUsd?: number;
}): EngineSampleNoAnswer {
    return {
        status: "no_answer",
        modelId: requireModelId(input.modelId),
        reason: input.reason,
        sampledAt: nowIso(),
        latencyMs: Math.max(0, input.latencyMs),
        costUnits: normalizeCost(input.costUnits),
        ...normalizeReportedCost(input.reportedCostMicroUsd),
    };
}

export function failedSample(input: {
    modelId: string | null;
    error: EngineError;
    latencyMs: number;
    costUnits?: number;
    /** Some vendors charge for a refusal and say so. Recorded when they do. */
    reportedCostMicroUsd?: number;
}): EngineSampleFailed {
    return {
        status: "failed",
        modelId: input.modelId?.trim() || null,
        error: input.error,
        sampledAt: nowIso(),
        latencyMs: Math.max(0, input.latencyMs),
        costUnits: normalizeCost(input.costUnits ?? 0),
        ...normalizeReportedCost(input.reportedCostMicroUsd),
    };
}

/** Retryability is a property of the error kind, not of the caller's mood. */
const RETRYABLE_KINDS: ReadonlySet<EngineError["kind"]> = new Set([
    "rate_limited",
    "upstream_unavailable",
    "timeout",
]);

export function engineError(
    kind: EngineError["kind"],
    message: string,
    retryAfterMs?: number
): EngineError {
    return {
        kind,
        message,
        retryable: RETRYABLE_KINDS.has(kind),
        ...(retryAfterMs === undefined ? {} : { retryAfterMs }),
    };
}
