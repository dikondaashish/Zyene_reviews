import { describe, expect, it } from "vitest";

import { computeAnswerVolatility } from "../../src/services/aeo/analytics/answer-volatility";
import { correlateCitationTraffic } from "../../src/services/aeo/analytics/citation-traffic-correlation";
import { detectCompetitorPageChanges } from "../../src/services/aeo/competitors/page-change-detector";
import { detectMetricAnomaly } from "../../src/services/aeo/alerting/anomaly-detection";

describe("Phase 3 analytics", () => {
    it("computes answer and citation churn without treating order as change", () => {
        const result = computeAnswerVolatility([
            { answerText: "Best barbecue includes Wolfpack BBQ", citations: ["https://a.test/x", "https://b.test/y"] },
            { answerText: "Wolfpack BBQ includes the best barbecue", citations: ["https://b.test/y", "https://a.test/x"] },
            { answerText: "Try a downtown burger restaurant", citations: ["https://c.test/z"] },
        ]);
        expect(result.observations).toBe(3);
        expect(result.score).toBeGreaterThan(0);
        expect(result.score).toBeLessThanOrEqual(1);
        expect(result.citationVolatility).toBeCloseTo(2 / 3, 4);
    });

    it("labels citation and traffic correlation as non-causal", () => {
        const result = correlateCitationTraffic(Array.from({ length: 10 }, (_, index) => ({
            date: `2026-07-${String(index + 1).padStart(2, "0")}`,
            citationEvents: index + 1,
            clicks: (index + 1) * 3,
        })));
        expect(result.correlation).toBeCloseTo(1, 6);
        expect(result.overlappingDays).toBe(10);
        expect(result.interpretation).toContain("does not establish causation");
    });

    it("detects new, changed, and citation-gaining competitor pages", () => {
        const changes = detectCompetitorPageChanges(
            [{ url: "https://rival.test/menu", contentHash: "old", citations: 1 }],
            [
                { url: "https://rival.test/menu", contentHash: "new", citations: 3 },
                { url: "https://rival.test/catering", contentHash: "fresh", citations: 1 },
            ]
        );
        expect(changes).toEqual([
            { url: "https://rival.test/menu", changeTypes: ["updated", "citation_gain"], citationDelta: 2 },
            { url: "https://rival.test/catering", changeTypes: ["new", "citation_gain"], citationDelta: 1 },
        ]);
    });

    it("withholds anomaly detection until 90 distinct days exist", () => {
        const short = Array.from({ length: 89 }, (_, index) => ({ date: `2026-01-${index}`, value: 10 }));
        expect(detectMetricAnomaly(short, { date: "2026-04-01", value: 100 })).toMatchObject({ eligible: false, reason: "insufficient_history" });
    });

    it("uses a robust median deviation after the history gate", () => {
        const history = Array.from({ length: 90 }, (_, index) => ({ date: `day-${index}`, value: 10 + (index % 3) }));
        expect(detectMetricAnomaly(history, { date: "day-91", value: 40 })).toMatchObject({ eligible: true, anomalous: true, direction: "up" });
    });
});
