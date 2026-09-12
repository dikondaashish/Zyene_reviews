import { afterEach, expect, it, vi } from "vitest";
import { fetchReviewsPageData, updateReviewsPageUrl } from "@/components/reviews/reviews-page-client-fetch";
afterEach(() => vi.unstubAllGlobals());
it("does not let a completed fetch change navigation before the caller checks freshness", async () => {
    const replaceState = vi.fn();
    vi.stubGlobal("window", { location: { href: "https://example.test/reviews?q=newer" }, history: { replaceState } });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ reviews: [], count: 0 }) }));
    const params = { type: "public", status: "all", rating: "all", sort: "newest", q: "older", page: 1 };
    await fetchReviewsPageData(params);
    expect(replaceState).not.toHaveBeenCalled();
    updateReviewsPageUrl({ ...params, q: "accepted" });
    expect(replaceState).toHaveBeenCalledOnce();
    expect(replaceState.mock.calls[0][2]).toContain("q=accepted");
});
