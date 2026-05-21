import { describe, expect, it } from "vitest";
import {
    buildTagsPromptFragment,
    buildTagsSelected,
    EVERYTHING_TAG,
    normalizeCustomTagInput,
    tagsForAi,
    toCustomTagStored,
} from "../../src/lib/review-flow/tags-for-ai";

describe("tagsForAi", () => {
    it("detects everything mode", () => {
        expect(tagsForAi([EVERYTHING_TAG]).mode).toBe("everything");
    });

    it("splits custom and preset tags", () => {
        const result = tagsForAi(["Professional", toCustomTagStored("On-time arrival")]);
        expect(result.mode).toBe("specific");
        if (result.mode === "specific") {
            expect(result.presets).toEqual(["Professional"]);
            expect(result.custom).toEqual(["On-time arrival"]);
        }
    });

    it("buildTagsSelected prefixes custom entries", () => {
        expect(buildTagsSelected(["Friendly"], ["Fast service"])).toEqual([
            "Friendly",
            "custom:Fast service",
        ]);
    });

    it("prompt prefers custom phrases in specific mode", () => {
        const parsed = tagsForAi([toCustomTagStored("Spotless ducts")]);
        const fragment = buildTagsPromptFragment(parsed, 5);
        expect(fragment).toContain("Spotless ducts");
        expect(fragment).toContain("own words");
    });
});

describe("normalizeCustomTagInput", () => {
    it("trims and caps length", () => {
        expect(normalizeCustomTagInput("  hello   world  ")).toBe("hello world");
        expect(normalizeCustomTagInput("a".repeat(100)).length).toBe(80);
    });
});
