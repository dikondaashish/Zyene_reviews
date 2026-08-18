import { describe, expect, it } from "vitest";

import {
    cityOrCategoryCoverage,
    promptDedupeKey,
    PROMPT_CLUSTERS,
    suggestPrompts,
} from "../../src/services/aeo/prompts/suggest-prompts";

const WOLFPACK = {
    businessName: "Wolfpack BBQ",
    category: "Barbecue restaurant",
    city: "Kansas City",
};

describe("F4.2 suggestions — QA criterion #20", () => {
    it("produces at least 15 prompts for a business with a category and city", () => {
        expect(suggestPrompts(WOLFPACK).length).toBeGreaterThanOrEqual(15);
    });

    it("has at least 80% of prompts naming the city or the category", () => {
        const suggestions = suggestPrompts(WOLFPACK);
        expect(cityOrCategoryCoverage(suggestions, WOLFPACK)).toBeGreaterThanOrEqual(0.8);
    });

    it("still clears both bars when the business has no city on file", () => {
        const input = { ...WOLFPACK, city: null };
        const suggestions = suggestPrompts(input);

        expect(suggestions.length).toBeGreaterThanOrEqual(15);
        expect(cityOrCategoryCoverage(suggestions, input)).toBeGreaterThanOrEqual(0.8);
    });
});

describe("F4.2 suggestions — text quality", () => {
    it("never leaves an unfilled token or a dangling preposition", () => {
        for (const input of [WOLFPACK, { ...WOLFPACK, city: null }]) {
            for (const { promptText } of suggestPrompts(input)) {
                expect(promptText, promptText).not.toMatch(/\{|\}/);
                expect(promptText, promptText).not.toMatch(/\s(in|near)\s*$/);
                expect(promptText, promptText).not.toMatch(/\s{2,}/);
                expect(promptText.trim(), promptText).toBe(promptText);
            }
        }
    });

    it("emits no duplicate prompts, including after city collapse", () => {
        for (const input of [WOLFPACK, { ...WOLFPACK, city: null }]) {
            const keys = suggestPrompts(input).map((s) => promptDedupeKey(s.promptText));
            expect(new Set(keys).size).toBe(keys.length);
        }
    });

    it("returns nothing rather than guessing when there is no category", () => {
        expect(suggestPrompts({ ...WOLFPACK, category: null })).toEqual([]);
        expect(suggestPrompts({ ...WOLFPACK, category: "   " })).toEqual([]);
    });

    it("returns nothing when the business has no name", () => {
        expect(suggestPrompts({ ...WOLFPACK, businessName: "" })).toEqual([]);
    });
});

describe("F4.3 clusters", () => {
    it("files every suggestion under one of the four known clusters", () => {
        const valid = new Set<string>(Object.values(PROMPT_CLUSTERS));
        for (const suggestion of suggestPrompts(WOLFPACK)) {
            expect(valid.has(suggestion.clusterName), suggestion.clusterName).toBe(true);
        }
    });

    it("covers all four intents, so no cluster ships empty", () => {
        const intents = new Set(suggestPrompts(WOLFPACK).map((s) => s.intent));
        expect([...intents].sort()).toEqual([
            "branded",
            "comparison",
            "discovery",
            "transactional",
        ]);
    });

    it("keeps a suggestion's cluster consistent with its intent", () => {
        for (const suggestion of suggestPrompts(WOLFPACK)) {
            expect(suggestion.clusterName).toBe(PROMPT_CLUSTERS[suggestion.intent]);
        }
    });
});

describe("promptDedupeKey", () => {
    it("treats case and spacing differences as the same prompt", () => {
        expect(promptDedupeKey("  Best   BBQ in Kansas City ")).toBe(
            promptDedupeKey("best bbq in kansas city")
        );
    });
});
