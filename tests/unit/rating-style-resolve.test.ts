import { describe, expect, it } from "vitest";

/** Mirrors src/app/r/[slug]/page.tsx rating_style normalization. */
function resolveRatingStyle(raw: string | null | undefined) {
    return raw === "stars" ||
        raw === "number" ||
        raw === "slider" ||
        raw === "radio"
        ? raw
        : "emoji";
}

describe("resolveRatingStyle (public review page)", () => {
    it("uses stars when saved in DB", () => {
        expect(resolveRatingStyle("stars")).toBe("stars");
    });

    it("defaults to emoji for null or unknown", () => {
        expect(resolveRatingStyle(null)).toBe("emoji");
        expect(resolveRatingStyle(undefined)).toBe("emoji");
        expect(resolveRatingStyle("faces")).toBe("emoji");
    });
});
