import { expect, it } from "vitest";
import { reviewSearchFilter } from "@/lib/reviews/search-filter";
it("searches reviewer and content using a quoted literal", () => {
    expect(reviewSearchFilter("Alice")).toBe('author_name.ilike."%Alice%",text.ilike."%Alice%"');
    expect(reviewSearchFilter("café, (great)")).toBe('author_name.ilike."%café, (great)%",text.ilike."%café, (great)%"');
});
it("escapes filter syntax and SQL wildcards inside search text", () => {
    const filter = reviewSearchFilter('a"b%_\\c');
    expect(filter).toBe('author_name.ilike."%a\\"b\\\\%\\\\_\\\\\\\\c%",text.ilike."%a\\"b\\\\%\\\\_\\\\\\\\c%"');
    expect(reviewSearchFilter("  ")).toBeNull();
});
