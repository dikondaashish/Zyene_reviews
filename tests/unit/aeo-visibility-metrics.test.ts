import { describe, expect, it } from "vitest";

import {
    computeEngineVisibility,
    computeOverallVisibility,
    MIN_OBSERVATIONS,
    type SampleFact,
} from "../../src/services/aeo/reporting/visibility-metrics";
import type { AnswerEngineId } from "../../src/services/aeo/engines/engine-types";

function fact(over: Partial<SampleFact> & { engineId: AnswerEngineId }): SampleFact {
    return {
        status: "ok",
        modelId: "m1",
        ownBrandNamed: false,
        isEstimated: false,
        hasStoredAnswer: true,
        sampledAt: "2026-08-07T12:00:00.000Z",
        ...over,
    };
}

function many(n: number, over: Partial<SampleFact> & { engineId: AnswerEngineId }): SampleFact[] {
    return Array.from({ length: n }, () => fact(over));
}

describe("QA #37 — a rate needs enough observations to mean anything", () => {
    it("suppresses a rate computed from fewer than three observations", () => {
        // The real case: google_ai_overview returned one answer, four no_answers
        // and five failures. One answer is not a visibility rate.
        const [ai] = computeEngineVisibility([
            fact({ engineId: "google_ai_overview" }),
            ...many(4, { engineId: "google_ai_overview", status: "no_answer" }),
            ...many(5, { engineId: "google_ai_overview", status: "failed" }),
        ]);

        expect(ai.observations).toBe(1);
        expect(ai.suppressed).toEqual({
            reason: "insufficient_observations",
            observations: 1,
            required: MIN_OBSERVATIONS,
        });
    });

    it("reports null, never zero, for a suppressed rate", () => {
        // The distinction the whole module exists for: a suppressed rate that
        // coalesced to 0 would render as "0% visibility" — a confident claim of
        // absence drawn from one sample.
        const [ai] = computeEngineVisibility([fact({ engineId: "google_ai_overview" })]);
        expect(ai.visibilityRate).toBeNull();
        expect(ai.visibilityRate).not.toBe(0);
    });

    it("reports a genuine zero when there are enough observations", () => {
        // ChatGPT answered ten times and named the business in none. That IS 0%,
        // and it must stay distinguishable from the suppressed case above.
        const [chatgpt] = computeEngineVisibility(many(10, { engineId: "chatgpt" }));
        expect(chatgpt.visibilityRate).toBe(0);
        expect(chatgpt.suppressed).toBeNull();
    });

    it("counts only answers in the denominator, never failures or refusals", () => {
        // A transport failure is not evidence of absence, and an engine that
        // declined to answer did not answer without the brand.
        const [serp] = computeEngineVisibility([
            ...many(3, { engineId: "google_serp" }),
            ...many(7, { engineId: "google_serp", status: "failed" }),
            ...many(2, { engineId: "google_serp", status: "no_answer" }),
        ]);
        expect(serp.observations).toBe(3);
        expect(serp.visibilityRate).toBe(0);
    });
});

describe("what a tile can say about its own number", () => {
    it("records every model behind the samples, so a changeover is visible", () => {
        const [gemini] = computeEngineVisibility([
            fact({ engineId: "gemini", modelId: "gemini-2.5-flash" }),
            fact({ engineId: "gemini", modelId: "gemini-2.5-flash" }),
            fact({ engineId: "gemini", modelId: "gemini-3-flash" }),
        ]);
        expect(gemini.provenance.modelIds).toEqual(["gemini-2.5-flash", "gemini-3-flash"]);
    });

    it("spans the first and last sample time", () => {
        const [gemini] = computeEngineVisibility([
            fact({ engineId: "gemini", sampledAt: "2026-08-07T09:00:00.000Z" }),
            fact({ engineId: "gemini", sampledAt: "2026-08-07T11:00:00.000Z" }),
            fact({ engineId: "gemini", sampledAt: "2026-08-07T10:00:00.000Z" }),
        ]);
        expect(gemini.provenance.firstSampledAt).toBe("2026-08-07T09:00:00.000Z");
        expect(gemini.provenance.lastSampledAt).toBe("2026-08-07T11:00:00.000Z");
    });

    it("is Measured when every sample was, and Estimated if any was not", () => {
        expect(computeEngineVisibility(many(3, { engineId: "gemini" }))[0].provenance.basis).toBe("measured");

        const mixed = computeEngineVisibility([
            ...many(2, { engineId: "gemini" }),
            fact({ engineId: "gemini", isEstimated: true }),
        ]);
        // One inferred sample taints the tile: a number partly derived from an
        // estimate is not a measurement, and QA #36 forbids implying otherwise.
        expect(mixed[0].provenance.basis).toBe("estimated");
    });

    it("counts retrievable answers separately from observations", () => {
        // Samples taken before E-8 have no stored answer. The drawer has to show
        // "evidence not retained", not imply the engine produced nothing.
        const [gemini] = computeEngineVisibility([
            ...many(2, { engineId: "gemini", hasStoredAnswer: false }),
            fact({ engineId: "gemini", hasStoredAnswer: true }),
        ]);
        expect(gemini.provenance.observations).toBe(3);
        expect(gemini.provenance.withStoredAnswer).toBe(1);
    });

    it("keeps an engine that only ever failed, rather than dropping it", () => {
        const [serp] = computeEngineVisibility(many(5, { engineId: "google_serp", status: "failed" }));
        expect(serp.failed).toBe(5);
        expect(serp.observations).toBe(0);
        expect(serp.visibilityRate).toBeNull();
    });
});

describe("pooling across engines", () => {
    it("pools observations rather than averaging per-engine rates", () => {
        // 1 of 20 on gemini and 0 of 10 on chatgpt is 1/30, not the 2.5% an
        // average of the two rates would give.
        const facts = [
            fact({ engineId: "gemini", ownBrandNamed: true }),
            ...many(19, { engineId: "gemini" }),
            ...many(10, { engineId: "chatgpt" }),
        ];
        const overall = computeOverallVisibility(facts);
        expect(overall.observations).toBe(30);
        expect(overall.namedCount).toBe(1);
        expect(overall.visibilityRate).toBeCloseTo(1 / 30);
    });

    it("counts observations from engines whose own rate was suppressed", () => {
        // Thin per-engine samples are exactly what pooling is for; excluding them
        // would discard real answers to honour a per-engine threshold.
        const overall = computeOverallVisibility([
            fact({ engineId: "google_ai_overview", ownBrandNamed: true }),
            ...many(2, { engineId: "google_serp" }),
        ]);
        expect(overall.observations).toBe(3);
        expect(overall.visibilityRate).toBeCloseTo(1 / 3);
    });

    it("suppresses the pooled rate too when the whole pool is thin", () => {
        const overall = computeOverallVisibility(many(2, { engineId: "gemini" }));
        expect(overall.visibilityRate).toBeNull();
        expect(overall.suppressed?.observations).toBe(2);
    });
});
