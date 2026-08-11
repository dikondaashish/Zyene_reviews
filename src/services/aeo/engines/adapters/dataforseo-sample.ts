import {
    citationsPresent,
    citationsUnavailable,
    noAnswerSample,
    okSample,
} from "../engine-result";
import type { EngineSampleResult } from "../engine-types";
import type { DataForSeoItem } from "./dataforseo-client";
import { serializeAiOverview, serializeSerp } from "./dataforseo-serialize";

/**
 * Shaping a DataForSEO response into an EngineSampleResult.
 *
 * Pure, and separate from the adapter, so the distinction that matters here can
 * be tested without any HTTP: an empty SERP and a missing AI Overview are both
 * `no_answer` — real observations about the page — and NEVER `failed` and never
 * an ok sample with empty text. A caller must not be able to read either as
 * "the brand was not found".
 */

export type ShapeContext = {
    modelId: string;
    latencyMs: number;
    costUnits: number;
    cost: { reportedCostMicroUsd?: number };
};

export function serpSample(
    items: readonly DataForSeoItem[],
    ctx: ShapeContext
): EngineSampleResult {
    const { text, sources } = serializeSerp(items);

    if (!text) {
        return noAnswerSample({
            modelId: ctx.modelId,
            reason: "SERP returned no local pack or organic results",
            latencyMs: ctx.latencyMs,
            costUnits: ctx.costUnits,
            ...ctx.cost,
        });
    }

    return okSample({
        modelId: ctx.modelId,
        answerText: text,
        // A SERP always exposes its sources, so an empty list is a real zero
        // rather than "this surface has no notion of sources".
        citations: citationsPresent(sources),
        latencyMs: ctx.latencyMs,
        costUnits: ctx.costUnits,
        ...ctx.cost,
    });
}

export function aiOverviewSample(
    items: readonly DataForSeoItem[],
    ctx: ShapeContext
): EngineSampleResult {
    const overview = items.find((item) => item.type === "ai_overview");

    // Google does not show an AI Overview for every query. That is a real
    // observation about the SERP, not a failure and not an absence of our
    // brand — so it is `no_answer`, which stays out of every denominator.
    if (!overview) {
        return noAnswerSample({
            modelId: ctx.modelId,
            reason: "Google returned no AI Overview for this query",
            latencyMs: ctx.latencyMs,
            costUnits: ctx.costUnits,
            ...ctx.cost,
        });
    }

    const { text, sources } = serializeAiOverview(overview);

    if (!text) {
        return noAnswerSample({
            modelId: ctx.modelId,
            reason: overview.asynchronous_ai_overview
                ? "AI Overview was still being fetched asynchronously"
                : "AI Overview present but carried no text",
            latencyMs: ctx.latencyMs,
            costUnits: ctx.costUnits,
            ...ctx.cost,
        });
    }

    return okSample({
        modelId: ctx.modelId,
        answerText: text,
        citations: sources.length ? citationsPresent(sources) : citationsUnavailable(),
        latencyMs: ctx.latencyMs,
        costUnits: ctx.costUnits,
        ...ctx.cost,
    });
}
