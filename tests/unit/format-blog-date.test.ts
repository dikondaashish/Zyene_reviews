import { describe, expect, it } from "vitest";

import { formatBlogPublishedDate, parseBlogPublishedDate } from "@/lib/content/format-blog-date";

describe("formatBlogPublishedDate", () => {
    it("parses YYYY-MM-DD at noon to avoid UTC day flips", () => {
        const date = parseBlogPublishedDate("2026-03-01");
        expect(date.getHours()).toBe(12);
        expect(date.getDate()).toBe(1);
    });

    it("formats short and long styles", () => {
        expect(formatBlogPublishedDate("2026-03-01")).toBe("Mar 1, 2026");
        expect(formatBlogPublishedDate("2026-03-01", "long")).toBe("March 1, 2026");
    });
});
