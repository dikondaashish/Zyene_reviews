import { describe, expect, it } from "vitest";
import {
    detectVisibilityAlerts,
    groupByPromptEngine,
    type VisibilitySampleFact,
} from "../../src/services/aeo/alerting/detect-visibility-alerts";

function fact(overrides: Partial<VisibilitySampleFact>): VisibilitySampleFact {
    return {
        promptId: "p1",
        promptText: "best bbq in kc",
        engineId: "gemini",
        status: "ok",
        ownBrandNamed: true,
        sampledAt: "2026-08-01T00:00:00.000Z",
        ...overrides,
    };
}

describe("groupByPromptEngine", () => {
    it("groups by the (promptId, engineId) pair, not promptId alone", () => {
        const facts = [
            fact({ promptId: "p1", engineId: "gemini" }),
            fact({ promptId: "p1", engineId: "chatgpt" }),
        ];
        const grouped = groupByPromptEngine(facts);
        expect(grouped.size).toBe(2);
    });
});

describe("detectVisibilityAlerts", () => {
    it("produces no alert without enough history in both windows", () => {
        // Only 4 observed samples; windowSize=3 needs 6.
        const facts = Array.from({ length: 4 }, (_, i) => fact({ sampledAt: `2026-08-0${i + 1}` }));
        const grouped = groupByPromptEngine(facts);
        expect(detectVisibilityAlerts(grouped)).toEqual([]);
    });

    it("flags a real drop: named every time at baseline, absent every time recently", () => {
        const recent = Array.from({ length: 3 }, (_, i) => fact({ ownBrandNamed: false, sampledAt: `recent-${i}` }));
        const baseline = Array.from({ length: 3 }, (_, i) => fact({ ownBrandNamed: true, sampledAt: `baseline-${i}` }));
        // Newest-first: recent window comes first in the array.
        const grouped = groupByPromptEngine([...recent, ...baseline]);
        const alerts = detectVisibilityAlerts(grouped);
        expect(alerts).toHaveLength(1);
        expect(alerts[0].direction).toBe("drop");
        expect(alerts[0].promptId).toBe("p1");
    });

    it("flags a real gain in the opposite direction", () => {
        const recent = Array.from({ length: 3 }, () => fact({ ownBrandNamed: true }));
        const baseline = Array.from({ length: 3 }, () => fact({ ownBrandNamed: false }));
        const grouped = groupByPromptEngine([...recent, ...baseline]);
        const alerts = detectVisibilityAlerts(grouped);
        expect(alerts[0].direction).toBe("gain");
    });

    it("does not flag a stable rate as an alert", () => {
        const all = Array.from({ length: 6 }, (_, i) => fact({ ownBrandNamed: i % 2 === 0 }));
        const grouped = groupByPromptEngine(all);
        expect(detectVisibilityAlerts(grouped)).toEqual([]);
    });

    it("excludes no_answer/failed samples from both windows' trial counts", () => {
        const recent = [
            fact({ status: "failed" }),
            fact({ status: "no_answer" }),
            ...Array.from({ length: 3 }, () => fact({ ownBrandNamed: false })),
        ];
        const baseline = Array.from({ length: 3 }, () => fact({ ownBrandNamed: true }));
        const grouped = groupByPromptEngine([...recent, ...baseline]);
        const alerts = detectVisibilityAlerts(grouped);
        expect(alerts).toHaveLength(1);
        expect(alerts[0].recentTrials).toBe(3); // not 5 — the failed/no_answer rows don't count as trials
    });

    it("evaluates multiple (prompt, engine) pairs independently", () => {
        const droppingPair = [
            ...Array.from({ length: 3 }, () => fact({ promptId: "p1", engineId: "gemini", ownBrandNamed: false })),
            ...Array.from({ length: 3 }, () => fact({ promptId: "p1", engineId: "gemini", ownBrandNamed: true })),
        ];
        const stablePair = Array.from({ length: 6 }, () => fact({ promptId: "p2", engineId: "chatgpt", ownBrandNamed: true }));
        const grouped = groupByPromptEngine([...droppingPair, ...stablePair]);
        const alerts = detectVisibilityAlerts(grouped);
        expect(alerts).toHaveLength(1);
        expect(alerts[0].engineId).toBe("gemini");
    });
});
