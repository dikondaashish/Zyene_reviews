import { afterEach, describe, expect, it, vi } from "vitest";

import { computeRenderingDelta } from "../../src/services/aeo/technical-audit/rendering-delta";
import { fetchPageSpeed, parsePageSpeedResult } from "../../src/services/aeo/technical-audit/pagespeed";
import { classifyIndexStatus } from "../../src/services/google/url-inspection";

describe("JS rendering delta", () => {
    it("measures content added only after JavaScript", () => {
        const result = computeRenderingDelta(
            "<html><body><main>Emergency plumbing in Austin</main></body></html>",
            "Emergency plumbing in Austin. Available every day with licensed technicians."
        );
        expect(result.rawWordCount).toBe(4);
        expect(result.renderedWordCount).toBe(10);
        expect(result.jsOnlyWordCount).toBe(6);
        expect(result.jsDeltaRatio).toBe(0.6);
    });
});

describe("PageSpeed and CrUX parsing", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("prefers field CWV and keeps Lighthouse performance score", () => {
        const parsed = parsePageSpeedResult({
            loadingExperience: { metrics: {
                LARGEST_CONTENTFUL_PAINT_MS: { percentile: 2100 },
                CUMULATIVE_LAYOUT_SHIFT_SCORE: { percentile: 12 },
                INTERACTION_TO_NEXT_PAINT: { percentile: 180 },
            } },
            lighthouseResult: { categories: { performance: { score: 0.91 } }, audits: {} },
        });
        expect(parsed).toMatchObject({ lcpMs: 2100, cls: 0.12, inpMs: 180, performanceScore: 91, basis: "field" });
    });

    it("retries without a restricted API key after a 403", async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(new Response("restricted", { status: 403 }))
            .mockResolvedValueOnce(new Response(JSON.stringify({
                lighthouseResult: {
                    categories: { performance: { score: 0.87 } },
                    audits: {},
                },
            }), { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);

        const result = await fetchPageSpeed("https://example.com/", "restricted-key");

        expect(result).toMatchObject({ performanceScore: 87, basis: "lab" });
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(String(fetchMock.mock.calls[0]?.[0])).toContain("key=restricted-key");
        expect(String(fetchMock.mock.calls[1]?.[0])).not.toContain("key=");
    });
});

describe("Search Console index verdict", () => {
    it.each([
        ["PASS", "Submitted and indexed", "indexed"],
        ["NEUTRAL", "Discovered - currently not indexed", "discovered_not_indexed"],
        ["NEUTRAL", "Crawled - currently not indexed", "crawled_not_indexed"],
        ["FAIL", "Blocked by robots.txt", "excluded"],
    ])("maps %s / %s", (verdict, coverageState, expected) => {
        expect(classifyIndexStatus({ verdict, coverageState })).toBe(expected);
    });
});
