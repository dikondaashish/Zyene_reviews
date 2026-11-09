import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchCompetitorMetricsOutcome } from "@/services/competitors/live-metrics-outcome";

vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }));

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe("fetchCompetitorMetricsOutcome", () => {
    const originalKey = process.env.GOOGLE_MAPS_API_KEY;
    const originalFallback = process.env.GOOGLE_API_KEY;
    afterEach(() => {
        vi.unstubAllGlobals();
        process.env.GOOGLE_MAPS_API_KEY = originalKey;
        process.env.GOOGLE_API_KEY = originalFallback;
        if (originalKey === undefined) delete process.env.GOOGLE_MAPS_API_KEY;
        if (originalFallback === undefined) delete process.env.GOOGLE_API_KEY;
    });

    it("reports a missing key as unavailable", async () => {
        delete process.env.GOOGLE_MAPS_API_KEY;
        delete process.env.GOOGLE_API_KEY;
        expect(await fetchCompetitorMetricsOutcome({ name: "Taj" })).toEqual({ kind: "unavailable", reason: "no_api_key" });
    });

    it("reports a healthy empty name search as not_found, not unavailable", async () => {
        process.env.GOOGLE_MAPS_API_KEY = "k";
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({ places: [] })));
        expect(await fetchCompetitorMetricsOutcome({ name: "Nowhere Diner" })).toEqual({ kind: "not_found" });
    });

    it("a closed picked place that falls back to an empty name search is not_found", async () => {
        process.env.GOOGLE_MAPS_API_KEY = "k";
        const fetchMock = vi.fn().mockResolvedValueOnce(json({}, 404)).mockResolvedValueOnce(json({}));
        vi.stubGlobal("fetch", fetchMock);
        const out = await fetchCompetitorMetricsOutcome({
            name: "Taj",
            googleUrl: "https://www.google.com/maps/search/?api=1&query_place_id=ChIJabcdefghij",
        });
        expect(out).toEqual({ kind: "not_found" });
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("reports an HTTP error after retries as unavailable", async () => {
        process.env.GOOGLE_MAPS_API_KEY = "k";
        vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => json({ error: "quota" }, 503)));
        expect(await fetchCompetitorMetricsOutcome({ name: "Taj", retries: 0 })).toEqual({ kind: "unavailable", reason: "request_failed" });
    });

    it("returns normalised metrics for a match", async () => {
        process.env.GOOGLE_MAPS_API_KEY = "k";
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({ places: [{ id: "places/x", rating: 4.56, userRatingCount: 120 }] })));
        expect(await fetchCompetitorMetricsOutcome({ name: "Taj" })).toEqual({
            kind: "ok",
            metrics: { averageRating: 4.6, totalReviews: 120, provider: "google_places", placeId: "places/x" },
        });
    });
});
