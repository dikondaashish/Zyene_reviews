import { describe, expect, it } from "vitest";
import { briefAgeDays, firstSentence, groupAiIdeas, toAiIdea, type AiInsightInput } from "@/lib/competitors/ai-ideas";

const input = (patch: Partial<AiInsightInput>): AiInsightInput => ({
    id: "i", competitorId: "c", competitorName: "Gates Bar-B-Q", priority: "low",
    summary: "Gates Bar-B-Q has seen a minor increase of 3 reviews, maintaining a steady 4.1 rating. This indicates consistent engagement.",
    whyItMatters: null, ownerSuggestion: null, actions: [], recommendations: [], confidence: 0.95, createdAt: "2026-10-22T08:00:00.000Z", ...patch,
});

describe("firstSentence", () => {
    it("keeps decimals like 4.1 intact and stops at the first full stop", () => {
        expect(firstSentence(input({}).summary)).toBe("Gates Bar-B-Q has seen a minor increase of 3 reviews, maintaining a steady 4.1 rating.");
    });
    it("returns the whole text when there is no sentence ending", () => {
        expect(firstSentence("No ending here")).toBe("No ending here");
    });
});

describe("toAiIdea", () => {
    it("shows one step first and folds the rest, without repeats", () => {
        const idea = toAiIdea(input({ actions: [{ title: "Monitor review sentiment" }], recommendations: ["Monitor review sentiment", "Analyze the 3 new reviews."] }));
        expect(idea.doThis).toBe("Monitor review sentiment");
        expect(idea.moreSteps).toEqual(["Analyze the 3 new reviews."]);
    });
});

describe("groupAiIdeas", () => {
    it("puts high and medium first and folds every low-priority 'keep watching' insight", () => {
        const { actNow, noAction } = groupAiIdeas([
            input({ id: "1", priority: "LOW" }),
            input({ id: "2", priority: "Medium" }),
            input({ id: "3", priority: "high" }),
        ]);
        expect(actNow.map((i) => i.id)).toEqual(["3", "2"]);
        expect(noAction.map((i) => i.id)).toEqual(["1"]);
    });
});

describe("briefAgeDays", () => {
    it("counts whole days so a six-month-old brief is flagged as out of date", () => {
        expect(briefAgeDays("2026-04-22T00:00:00.000Z", new Date("2026-10-22T00:00:00.000Z"))).toBe(183);
    });
});
