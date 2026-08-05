/**
 * E-1: the answer-engine sampling contract.
 *
 * Every engine — LLM or SERP, first-party or vendor-proxied — is reached through
 * `AnswerEngineAdapter`. Two properties of these types are load-bearing and should
 * not be "simplified" away:
 *
 * 1. An adapter returns what an engine SAID. It never returns whether our brand
 *    appeared. Presence is decided by a separate extraction pass, so no adapter is
 *    ever in a position to assert visibility — which is the exact bug class that
 *    produced the pre-Phase-1 heuristic surfaces.
 * 2. `failed` carries no answer payload at all. A caller cannot accidentally treat
 *    a transport failure as "brand not found" (QA criterion #2), because there is
 *    no field there to misread.
 */

/** Persisted verbatim on every sample row. Stable — never rename or reuse a value. */
export const ANSWER_ENGINE_IDS = [
    "google_serp",
    "google_ai_overview",
    "google_ai_mode",
    "chatgpt",
    "perplexity",
    "gemini",
    "claude",
    "copilot",
] as const;

export type AnswerEngineId = (typeof ANSWER_ENGINE_IDS)[number];

export function isAnswerEngineId(value: string): value is AnswerEngineId {
    return (ANSWER_ENGINE_IDS as readonly string[]).includes(value);
}

/** Where a sample was taken from. Coordinate drives the geo-grid (PRD-5). */
export type EngineLocale = {
    /** ISO 3166-1 alpha-2, e.g. "US". */
    country: string;
    /** ISO 639-1, e.g. "en". */
    language: string;
    city?: string;
    coordinate?: { lat: number; lng: number };
};

export type EngineSampleRequest = {
    prompt: string;
    locale: EngineLocale;
    /** 1-based repeat index within a run. Repeat sampling is F1.13. */
    attempt: number;
};

export type EngineCitation = {
    url: string;
    title: string | null;
    /** 1-based position within the answer's citation list. */
    ordinal: number;
};

/**
 * Tri-state on purpose. An engine that does not expose sources is NOT the same as
 * an engine that returned zero sources: the first must be excluded from the
 * citation-rate denominator, the second counts as a genuine zero (QA criterion #15).
 * Modelling this as a bare array loses that distinction irrecoverably.
 */
export type EngineCitations =
    | { availability: "present"; items: EngineCitation[] }
    | { availability: "unavailable"; items: readonly [] };

export type EngineErrorKind =
    | "rate_limited"
    | "upstream_unavailable"
    | "timeout"
    | "auth"
    | "invalid_request"
    | "quota_exhausted"
    | "unknown";

export type EngineError = {
    kind: EngineErrorKind;
    message: string;
    /** Drives E-7 retry policy. Auth and invalid_request are never retryable. */
    retryable: boolean;
    retryAfterMs?: number;
};

type EngineSampleBase = {
    /** ISO-8601. */
    sampledAt: string;
    latencyMs: number;
    /** Billable units consumed, in the engine's own credit weight (see catalog). */
    costUnits: number;
};

/** The engine answered. `answerText` is the verbatim response, stored as evidence. */
export type EngineSampleOk = EngineSampleBase & {
    status: "ok";
    /** Never empty — QA criterion #1 requires a model id on every stored sample. */
    modelId: string;
    answerText: string;
    citations: EngineCitations;
};

/** The engine ran but declined or produced nothing. Excluded from denominators. */
export type EngineSampleNoAnswer = EngineSampleBase & {
    status: "no_answer";
    modelId: string;
    reason: string;
};

/** The call did not complete. Never counted as a negative observation. */
export type EngineSampleFailed = EngineSampleBase & {
    status: "failed";
    /** Null when the request never reached a model. */
    modelId: string | null;
    error: EngineError;
};

export type EngineSampleResult = EngineSampleOk | EngineSampleNoAnswer | EngineSampleFailed;

/**
 * True only for samples that represent a real observation of engine output.
 * Use this to build every visibility denominator — never `status !== "failed"`,
 * which would silently fold `no_answer` back in.
 */
export function isObservation(result: EngineSampleResult): result is EngineSampleOk {
    return result.status === "ok";
}

/** Samples that cost money, whatever their outcome. Feeds the E-5 ledger. */
export function billableUnits(result: EngineSampleResult): number {
    return result.costUnits > 0 ? result.costUnits : 0;
}

export interface AnswerEngineAdapter {
    readonly id: AnswerEngineId;
    /** Reported on every sample so trend lines can be annotated at model changeover. */
    readonly modelId: string;
    /** False when required credentials or config are absent; keeps the engine out of runs. */
    isConfigured(): boolean;
    sample(request: EngineSampleRequest, signal?: AbortSignal): Promise<EngineSampleResult>;
}
