import { describe, expect, it } from "vitest";
import { createFakeDb } from "./helpers/fake-supabase";
import {
    fallbackReviewText,
    ratingToneInstruction,
    resolveMinStarsForGoogle,
} from "@/lib/review-flow/rating-tone";
import { buildTagsPromptFragment, fallbackHighlights, tagsForAi, EVERYTHING_TAG } from "@/lib/review-flow/tags-for-ai";
import { ratingGoesToGoogle } from "@/services/review-flow/google-rating-threshold";

describe("rating-aware review drafts", () => {
    it("keeps the 4-5 star prompt unchanged", () => {
        expect(ratingToneInstruction(5)).toBe("");
        expect(buildTagsPromptFragment(tagsForAi([EVERYTHING_TAG]), 5)).toContain("loved everything");
    });

    it("asks for a balanced tone at 3 stars instead of 'loved everything'", () => {
        const everything = buildTagsPromptFragment(tagsForAi([EVERYTHING_TAG]), 3);
        expect(everything).not.toContain("loved everything");
        expect(everything).toMatch(/balanced/);
        expect(buildTagsPromptFragment(tagsForAi([]), 3)).not.toContain("positive experience");
    });

    it.each([1, 2, 3])("never writes a gushing fallback at %i stars", (rating) => {
        const text = fallbackReviewText("Willow Cafe", ["coffee"], rating);
        expect(text).not.toMatch(/!|wonderful|fantastic|highly recommend/i);
        expect(text).toContain("Willow Cafe");
    });

    it("has no 'Highly recommend' in any fallback (the prompt forbids it)", () => {
        for (const rating of [1, 2, 3, 4, 5]) {
            expect(fallbackReviewText("Willow Cafe", [], rating)).not.toMatch(/highly recommend/i);
        }
    });

    it("turns picked tags into plain highlights", () => {
        expect(fallbackHighlights([EVERYTHING_TAG])).toEqual(["overall experience"]);
        expect(fallbackHighlights(["☕ Coffee", "custom:the latte art"])).toEqual(["the latte art", "Coffee"]);
    });

    it("defaults the threshold to 4 when unset or invalid, like the review page", () => {
        expect(resolveMinStarsForGoogle(null)).toBe(4);
        expect(resolveMinStarsForGoogle(9)).toBe(4);
        expect(resolveMinStarsForGoogle(3)).toBe(3);
    });
});

describe("ratingGoesToGoogle", () => {
    const db = (min: number | null) => createFakeDb({ businesses: [{ id: "b1", min_stars_for_google: min }] }).client as never;

    it("reads the business's own threshold", async () => {
        await expect(ratingGoesToGoogle(db(3), "b1", 3)).resolves.toBe(true);
        await expect(ratingGoesToGoogle(db(3), "b1", 2)).resolves.toBe(false);
        await expect(ratingGoesToGoogle(db(null), "b1", 3)).resolves.toBe(false);
        await expect(ratingGoesToGoogle(db(null), "b1", 4)).resolves.toBe(true);
    });

    it("returns null when the business cannot be read", async () => {
        await expect(ratingGoesToGoogle(db(3), "missing", 5)).resolves.toBeNull();
    });
});
