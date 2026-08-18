import { describe, expect, it } from "vitest";

import { diffCitationSets } from "../../src/services/aeo/analytics/citation-history";
import { computeClusterRollups } from "../../src/services/aeo/analytics/cluster-rollup";
import { classifyPrompt } from "../../src/services/aeo/analytics/prompt-intent";
import { matchReviewCorpus } from "../../src/services/aeo/analytics/review-citation-matcher";
import { computeRepeatVariance } from "../../src/services/aeo/analytics/sampling-variance";
import { computeSourceOverlap } from "../../src/services/aeo/analytics/source-overlap";
import { rankFreshnessQueue } from "../../src/services/aeo/content-briefs/freshness-queue";
import { parseMentionAnalysis } from "../../src/services/aeo/analytics/mention-analyzer";

describe("repeat sampling variance", () => {
    it("reports observed volatility and a bounded confidence interval", () => {
        const result = computeRepeatVariance([true, false, true, false]);
        expect(result).toMatchObject({ attempts: 4, namedCount: 2, rate: 0.5, variance: 1 / 3 });
        expect(result.confidence95.low).toBeGreaterThanOrEqual(0);
        expect(result.confidence95.high).toBeLessThanOrEqual(1);
    });

    it("withholds variance when repeats did not actually run", () => {
        expect(computeRepeatVariance([true])).toMatchObject({ attempts: 1, variance: null });
    });
});

describe("citation history", () => {
    it("separates gained, lost, and ordinal movement", () => {
        expect(diffCitationSets(
            [{ url: "a", ordinal: 1 }, { url: "b", ordinal: 4 }, { url: "lost", ordinal: 2 }],
            [{ url: "a", ordinal: 3 }, { url: "b", ordinal: 2 }, { url: "new", ordinal: 1 }]
        )).toEqual([
            { normalizedUrl: "a", changeType: "moved_down", previousOrdinal: 1, currentOrdinal: 3 },
            { normalizedUrl: "b", changeType: "moved_up", previousOrdinal: 4, currentOrdinal: 2 },
            { normalizedUrl: "lost", changeType: "lost", previousOrdinal: 2, currentOrdinal: null },
            { normalizedUrl: "new", changeType: "gained", previousOrdinal: null, currentOrdinal: 1 },
        ]);
    });
});

describe("review-corpus citation matching", () => {
    const reviews = [
        { id: "r1", text: "They arrived within twenty minutes and fixed the leak immediately." },
        { id: "r2", text: "Friendly front desk and very clean waiting room." },
    ];

    it("detects evidence-backed quotes", () => {
        const matches = matchReviewCorpus("Customers report they arrived within twenty minutes and fixed the leak immediately.", reviews);
        expect(matches[0]).toMatchObject({ reviewId: "r1", matchKind: "quote", confidence: 1 });
    });

    it("requires substantial overlap before calling text a paraphrase", () => {
        expect(matchReviewCorpus("Reviewers praise the clean waiting room and friendly front desk.", reviews)[0]).toMatchObject({ reviewId: "r2", matchKind: "paraphrase" });
        expect(matchReviewCorpus("This company is locally owned.", reviews)).toEqual([]);
    });
});

describe("prompt intent and cluster rollups", () => {
    it.each([
        ["What is emergency plumbing?", "discovery", "awareness"],
        ["Radiant Plumbing vs ABC Plumbing", "comparison", "consideration"],
        ["Book a plumber near me today", "transactional", "decision"],
        ["Radiant Plumbing reviews", "branded", "consideration"],
    ])("classifies %s", (prompt, intent, funnelStage) => {
        expect(classifyPrompt(prompt, ["Radiant Plumbing"])).toEqual({ intent, funnelStage });
    });

    it("rolls observations and share of voice up by cluster", () => {
        const result = computeClusterRollups([
            { clusterId: "c1", clusterName: "Emergency", status: "ok", ownNamed: true, trackedMentions: 2, ownMentions: 1 },
            { clusterId: "c1", clusterName: "Emergency", status: "ok", ownNamed: false, trackedMentions: 1, ownMentions: 0 },
            { clusterId: "c1", clusterName: "Emergency", status: "failed", ownNamed: false, trackedMentions: 0, ownMentions: 0 },
        ]);
        expect(result[0]).toMatchObject({ observations: 2, visibilityRate: 0.5, shareOfVoice: 1 / 3, failed: 1 });
    });
});

describe("competitor source overlap and freshness", () => {
    it("returns sources competitors have that the business does not", () => {
        expect(computeSourceOverlap([
            { domain: "yelp.com", brandKind: "own" },
            { domain: "yelp.com", brandKind: "competitor" },
            { domain: "angi.com", brandKind: "competitor" },
        ])).toEqual([{ domain: "angi.com", competitorCitations: 1, ownCitations: 0 }]);
    });

    it("prioritizes lost citations and stale pages using measured deltas", () => {
        const ranked = rankFreshnessQueue([
            { url: "https://a.test", lostCitations: 2, rankDrop: 3, daysSinceUpdate: 400 },
            { url: "https://b.test", lostCitations: 0, rankDrop: 1, daysSinceUpdate: 20 },
        ]);
        expect(ranked[0]?.url).toBe("https://a.test");
        expect(ranked[0]?.score).toBeGreaterThan(ranked[1]?.score ?? 0);
    });
});

describe("mention analysis", () => {
    it("keeps rationale and attributes only for brands actually found by deterministic extraction", () => {
        const parsed = parseMentionAnalysis(JSON.stringify({ mentions: [
            { brand: "Radiant", sentiment: "positive", rationale: "Described as responsive.", attributes: [{ name: "speed", polarity: "positive", evidence: "responds quickly" }] },
            { brand: "Invented Co", sentiment: "negative", rationale: "Hallucinated.", attributes: [] },
        ] }), ["Radiant"]);
        expect(parsed).toHaveLength(1);
        expect(parsed[0]).toMatchObject({ brand: "Radiant", sentiment: "positive", rationale: "Described as responsive." });
    });
});
