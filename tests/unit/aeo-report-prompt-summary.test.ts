import { describe, expect, it } from "vitest";
import { summarizePromptSamples } from "@/services/aeo/reporting/generate-report";

describe("summarizePromptSamples", () => {
    const names = new Map([
        ["p1", "best dentist near me"],
        ["p2", "emergency dentist"],
    ]);

    it("counts samples and own-brand mentions per prompt, skipping samples without a prompt", () => {
        const result = summarizePromptSamples(
            [
                { id: "s1", prompt_id: "p1" },
                { id: "s2", prompt_id: "p1" },
                { id: "s3", prompt_id: "p2" },
                { id: "s4", prompt_id: null },
            ],
            new Set(["s1", "s3", "s4"]),
            names,
        );

        expect(result).toEqual([
            { prompt: "best dentist near me", named: 1, samples: 2 },
            { prompt: "emergency dentist", named: 1, samples: 1 },
        ]);
    });

    it("labels unknown prompts and breaks sample ties by named count", () => {
        const result = summarizePromptSamples(
            [
                { id: "s1", prompt_id: "p1" },
                { id: "s2", prompt_id: "gone" },
            ],
            new Set(["s2"]),
            names,
        );

        expect(result.map((row) => row.prompt)).toEqual(["Deleted prompt", "best dentist near me"]);
    });

    it("keeps at most 20 prompts", () => {
        const samples = Array.from({ length: 25 }, (_, i) => ({ id: `s${i}`, prompt_id: `p${i}` }));
        expect(summarizePromptSamples(samples, new Set(), new Map())).toHaveLength(20);
    });
});
