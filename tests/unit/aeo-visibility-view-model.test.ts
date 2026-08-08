import { describe, expect, it } from "vitest";

import {
    formatRate,
    suppressionMessage,
    toVisibilityTiles,
} from "../../src/app/(dashboard)/google-seo-aeo/aeo-visibility-view-model";
import {
    computeEngineVisibility,
    type SampleFact,
} from "../../src/services/aeo/reporting/visibility-metrics";
import type { AnswerEngineId } from "../../src/services/aeo/engines/engine-types";

function fact(over: Partial<SampleFact> & { engineId: AnswerEngineId }): SampleFact {
    return {
        status: "ok",
        modelId: "gemini-2.5-flash",
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

function tilesFor(facts: SampleFact[]) {
    return toVisibilityTiles(computeEngineVisibility(facts), 30);
}

describe("a suppressed tile shows no number at all", () => {
    it("carries a null rate, so nothing can print it as a percentage", () => {
        const [tile] = tilesFor([fact({ engineId: "google_ai_overview" })]);
        expect(tile.rate).toBeNull();
        expect(tile.suppressedMessage).toBeTruthy();
    });

    it("says how many more answers are needed, not just 'not enough data'", () => {
        expect(suppressionMessage({ reason: "insufficient_observations", observations: 1, required: 3 })).toBe(
            "Only 1 answer so far — 2 more needed before this can be reported."
        );
        expect(suppressionMessage({ reason: "insufficient_observations", observations: 2, required: 3 })).toBe(
            "Only 2 answers so far — 1 more needed before this can be reported."
        );
    });

    it("distinguishes never-answered from thinly-answered", () => {
        expect(suppressionMessage({ reason: "insufficient_observations", observations: 0, required: 3 })).toBe(
            "No answers yet — needs 3 to report a rate."
        );
    });

    it("keeps a measured zero as a real number, not a suppression", () => {
        // The pair this whole surface turns on: 0% from ten answers is a finding;
        // 0 observations is not, and they must not render alike.
        const [measuredZero] = tilesFor(many(10, { engineId: "chatgpt" }));
        expect(measuredZero.rate).toBe("0%");
        expect(measuredZero.suppressedMessage).toBeNull();
    });
});

describe("rate formatting", () => {
    it("keeps a small non-zero rate from rounding down to 0%", () => {
        // 1 named in 200 answers is 0.5%. Printing "0%" would turn a real
        // sighting into an absence.
        expect(formatRate(0.005)).toBe("0.5%");
        expect(formatRate(0)).toBe("0%");
        expect(formatRate(0.25)).toBe("25%");
    });
});

describe("provenance is attached to the number it explains (QA #35)", () => {
    it("names the engine, its models, and the sample counts", () => {
        const [tile] = tilesFor(many(4, { engineId: "gemini" }));
        const rows = new Map(tile.provenance.map((r) => [r.label, r.value]));

        expect(rows.get("Engine")).toBe("Gemini");
        expect(rows.get("Model")).toBe("gemini-2.5-flash");
        expect(rows.get("Samples")).toBe("4 (4 answered)");
        expect(rows.get("Named the brand")).toBe("0 of 4");
    });

    it("separates refusals and failures from answers in the counts", () => {
        const [tile] = tilesFor([
            ...many(3, { engineId: "google_serp" }),
            ...many(7, { engineId: "google_serp", status: "failed" }),
            ...many(2, { engineId: "google_serp", status: "no_answer" }),
        ]);
        const rows = new Map(tile.provenance.map((r) => [r.label, r.value]));
        expect(rows.get("Samples")).toBe("12 (3 answered)");
        expect(rows.get("Failed")).toBe("7");
        expect(rows.get("No answer")).toBe("2");
    });

    it("admits when older answers were not retained", () => {
        const [tile] = tilesFor([
            ...many(3, { engineId: "gemini", hasStoredAnswer: false }),
            fact({ engineId: "gemini", hasStoredAnswer: true }),
        ]);
        const rows = new Map(tile.provenance.map((r) => [r.label, r.value]));
        expect(rows.get("Answer retained")).toBe("1 of 4 (older samples not kept)");
    });

    it("formats timestamps in a fixed zone so server and client agree", () => {
        // A locale-dependent string would hydrate differently than it rendered.
        const [tile] = tilesFor(many(3, { engineId: "gemini", sampledAt: "2026-08-07T12:00:00.000Z" }));
        const rows = new Map(tile.provenance.map((r) => [r.label, r.value]));
        expect(rows.get("First sampled")).toContain("UTC");
        expect(rows.get("First sampled")).toContain("Aug 7, 2026");
    });
});

describe("badging (QA #36)", () => {
    it("marks a tile Estimated when any contributing sample was", () => {
        const [tile] = tilesFor([
            ...many(3, { engineId: "gemini" }),
            fact({ engineId: "gemini", isEstimated: true }),
        ]);
        expect(tile.basis).toBe("estimated");
        expect(new Map(tile.provenance.map((r) => [r.label, r.value])).get("Basis")).toBe("Estimated");
    });

    it("marks a fully measured tile Measured", () => {
        expect(tilesFor(many(3, { engineId: "gemini" }))[0].basis).toBe("measured");
    });
});

describe("an engine that never answered", () => {
    it("describes the attempts instead of implying a zero rate", () => {
        const [tile] = tilesFor(many(5, { engineId: "google_serp", status: "failed" }));
        expect(tile.rate).toBeNull();
        expect(tile.detail).toBe("5 attempts, no answer read");
    });
});
