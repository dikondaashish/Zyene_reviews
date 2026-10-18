import { describe, expect, it } from "vitest";

import { trimIncompleteMarkdown } from "@/hooks/use-typewriter";

describe("trimIncompleteMarkdown", () => {
    it("hides a half-typed bold run until it closes", () => {
        expect(trimIncompleteMarkdown("Plans start at **$29")).toBe("Plans start at ");
        expect(trimIncompleteMarkdown("Plans start at **$29.99**")).toBe("Plans start at **$29.99**");
    });

    it("hides a half-typed link until it closes", () => {
        expect(trimIncompleteMarkdown("See [pricing](/pri")).toBe("See ");
        expect(trimIncompleteMarkdown("See [pric")).toBe("See ");
        expect(trimIncompleteMarkdown("See [pricing](/pricing) now")).toBe("See [pricing](/pricing) now");
    });

    it("leaves plain text alone", () => {
        expect(trimIncompleteMarkdown("Yes, we support Yelp")).toBe("Yes, we support Yelp");
    });
});
