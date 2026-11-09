import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ graphFetch: vi.fn() }));
vi.mock("@/services/facebook/client", () => ({ graphFetch: m.graphFetch }));

import { getReviews, MAX_FACEBOOK_REVIEW_PAGES } from "@/services/facebook/adapter";

const rating = (i: number) => ({
    created_time: "2026-01-01T00:00:00+0000",
    reviewer: { id: `r${i}`, name: `Reviewer ${i}` },
    recommendation_type: "positive" as const,
    open_graph_story: { id: `story-${i}` },
});
const page = (from: number, count: number, after?: string) => ({
    data: Array.from({ length: count }, (_, i) => rating(from + i)),
    paging: after ? { cursors: { before: "b", after }, next: `https://graph/next?after=${after}` } : { cursors: { before: "b", after: "end" } },
});

describe("Facebook ratings pagination", () => {
    beforeEach(() => m.graphFetch.mockReset());

    it("follows the after cursor past the first 50 ratings", async () => {
        m.graphFetch
            .mockResolvedValueOnce(page(0, 50, "c1"))
            .mockResolvedValueOnce(page(50, 100, "c2"))
            .mockResolvedValueOnce(page(150, 30));
        const result = await getReviews("page-1", "token");
        expect(result.recent).toHaveLength(50);
        expect(result.older).toHaveLength(130);
        expect(result.truncated).toBe(false);
        expect(m.graphFetch.mock.calls[1][0].params).toMatchObject({ after: "c1", limit: "100" });
        expect(m.graphFetch.mock.calls[0][0].params).not.toHaveProperty("after");
    });

    it("stops at the page cap and reports truncation", async () => {
        let n = 0;
        m.graphFetch.mockImplementation(async () => page(n++ * 100, 100, `c${n}`));
        const result = await getReviews("page-1", "token");
        expect(m.graphFetch).toHaveBeenCalledTimes(MAX_FACEBOOK_REVIEW_PAGES);
        expect(result.truncated).toBe(true);
    });

    it("stops when Facebook repeats a cursor instead of looping", async () => {
        m.graphFetch.mockResolvedValueOnce(page(0, 50, "same")).mockResolvedValueOnce(page(50, 10, "same"));
        await getReviews("page-1", "token");
        expect(m.graphFetch).toHaveBeenCalledTimes(2);
    });
});
