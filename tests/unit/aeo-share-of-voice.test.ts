import { describe, expect, it } from "vitest";

import { computeShareOfVoice, MIN_COMPETITORS_FOR_SOV } from "../../src/services/aeo/reporting/share-of-voice";
import { MIN_OBSERVATIONS } from "../../src/services/aeo/reporting/visibility-metrics";

describe("computeShareOfVoice", () => {
    it("suppresses below the minimum configured competitors, per PRD-3", () => {
        const result = computeShareOfVoice({
            observationSampleIds: ["s1", "s2", "s3", "s4", "s5"],
            mentions: [],
            competitorCount: MIN_COMPETITORS_FOR_SOV - 1,
        });
        expect(result).toEqual({
            suppressed: true,
            reason: "insufficient_competitors",
            competitorCount: MIN_COMPETITORS_FOR_SOV - 1,
            required: MIN_COMPETITORS_FOR_SOV,
        });
    });

    it("suppresses below the minimum observations even with enough competitors", () => {
        const result = computeShareOfVoice({
            observationSampleIds: Array.from({ length: MIN_OBSERVATIONS - 1 }, (_, i) => `s${i}`),
            mentions: [],
            competitorCount: 5,
        });
        expect(result).toEqual({
            suppressed: true,
            reason: "insufficient_observations",
            observations: MIN_OBSERVATIONS - 1,
            required: MIN_OBSERVATIONS,
        });
    });

    it("suppresses as no_brands_named when nothing was ever named, distinct from a computed zero", () => {
        const result = computeShareOfVoice({
            observationSampleIds: ["s1", "s2", "s3", "s4"],
            mentions: [],
            competitorCount: 5,
        });
        expect(result).toEqual({ suppressed: true, reason: "no_brands_named", observations: 4 });
    });

    it("computes share as mentions / total tracked mentions, ranked descending", () => {
        const result = computeShareOfVoice({
            observationSampleIds: ["s1", "s2", "s3", "s4"],
            mentions: [
                { sampleId: "s1", brandKind: "own", competitorId: null, brandLabel: "Us" },
                { sampleId: "s2", brandKind: "competitor", competitorId: "c1", brandLabel: "Rival A" },
                { sampleId: "s2", brandKind: "competitor", competitorId: "c2", brandLabel: "Rival B" },
                { sampleId: "s3", brandKind: "competitor", competitorId: "c1", brandLabel: "Rival A" },
            ],
            competitorCount: 3,
        });
        expect(result.suppressed).toBe(false);
        if (result.suppressed) throw new Error("unreachable");
        expect(result.totalTrackedMentions).toBe(4);
        expect(result.ownShare).toBe(0.25);
        expect(result.ranking[0]).toMatchObject({ label: "Rival A", mentions: 2, share: 0.5 });
        // s4 named nothing tracked — a real, disclosed opportunity signal.
        expect(result.noBrandNamedCount).toBe(1);
    });

    it("a sample naming multiple brands counts toward each, not split fractionally", () => {
        const result = computeShareOfVoice({
            observationSampleIds: ["s1", "s2", "s3"],
            mentions: [
                { sampleId: "s1", brandKind: "own", competitorId: null, brandLabel: "Us" },
                { sampleId: "s1", brandKind: "competitor", competitorId: "c1", brandLabel: "Rival A" },
            ],
            competitorCount: 3,
        });
        if (result.suppressed) throw new Error("unreachable");
        expect(result.totalTrackedMentions).toBe(2);
        expect(result.ownShare).toBe(0.5);
    });
});
