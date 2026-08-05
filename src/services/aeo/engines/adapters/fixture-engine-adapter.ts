import type {
    AnswerEngineAdapter,
    AnswerEngineId,
    EngineSampleRequest,
    EngineSampleResult,
} from "../engine-types";
import {
    citationsPresent,
    citationsUnavailable,
    engineError,
    failedSample,
    noAnswerSample,
    okSample,
} from "../engine-result";

/**
 * A zero-cost adapter that replays scripted answers.
 *
 * It exists so the orchestrator (E-7), the credit ledger (E-5), and the extraction
 * eval harness (E-6) can be built and tested end to end before a single vendor
 * contract is signed — and so failure paths (rate limits, refusals, timeouts) are
 * exercised deterministically rather than hoped for in production.
 *
 * Not auto-registered: callers construct and register it explicitly, so it can
 * never stand in for a real engine by accident.
 */

export type FixtureResponse =
    | {
          kind: "ok";
          answerText: string;
          /** Omit for engines that expose no sources — yields `citations_unavailable`. */
          citations?: ReadonlyArray<{ url: string; title?: string | null }>;
      }
    | { kind: "no_answer"; reason: string }
    | {
          kind: "failed";
          errorKind: Parameters<typeof engineError>[0];
          message: string;
          retryAfterMs?: number;
      };

export type FixtureEngineOptions = {
    id: AnswerEngineId;
    modelId: string;
    /** Keyed by exact prompt text. */
    responses?: ReadonlyMap<string, FixtureResponse>;
    /** Used when no keyed response matches. */
    fallback?: FixtureResponse;
    /** Reported latency; the adapter does not actually sleep. */
    latencyMs?: number;
    configured?: boolean;
};

const DEFAULT_FALLBACK: FixtureResponse = {
    kind: "ok",
    answerText: "No specific businesses were named in this answer.",
    citations: [],
};

export class FixtureEngineAdapter implements AnswerEngineAdapter {
    readonly id: AnswerEngineId;
    readonly modelId: string;

    private readonly responses: ReadonlyMap<string, FixtureResponse>;
    private readonly fallback: FixtureResponse;
    private readonly latencyMs: number;
    private readonly configured: boolean;

    /** Every request handled, in order. Lets tests assert on orchestrator behaviour. */
    readonly calls: EngineSampleRequest[] = [];

    constructor(options: FixtureEngineOptions) {
        this.id = options.id;
        this.modelId = options.modelId;
        this.responses = options.responses ?? new Map();
        this.fallback = options.fallback ?? DEFAULT_FALLBACK;
        this.latencyMs = options.latencyMs ?? 1;
        this.configured = options.configured ?? true;
    }

    isConfigured(): boolean {
        return this.configured;
    }

    async sample(request: EngineSampleRequest, signal?: AbortSignal): Promise<EngineSampleResult> {
        this.calls.push(request);

        if (signal?.aborted) {
            return failedSample({
                modelId: this.modelId,
                error: engineError("timeout", "Sampling aborted before dispatch."),
                latencyMs: 0,
            });
        }

        const response = this.responses.get(request.prompt) ?? this.fallback;
        return this.toResult(response);
    }

    private toResult(response: FixtureResponse): EngineSampleResult {
        if (response.kind === "failed") {
            return failedSample({
                modelId: this.modelId,
                error: engineError(response.errorKind, response.message, response.retryAfterMs),
                latencyMs: this.latencyMs,
            });
        }

        if (response.kind === "no_answer") {
            return noAnswerSample({
                modelId: this.modelId,
                reason: response.reason,
                latencyMs: this.latencyMs,
                // Fixtures are free; real adapters often still pay for a refusal.
                costUnits: 0,
            });
        }

        return okSample({
            modelId: this.modelId,
            answerText: response.answerText,
            citations: response.citations
                ? citationsPresent(response.citations)
                : citationsUnavailable(),
            latencyMs: this.latencyMs,
            costUnits: 0,
        });
    }
}
