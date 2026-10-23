import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ sync: vi.fn() }));
vi.mock("@/services/cron/competitor-watch-row-metrics", () => ({ syncCompetitorWatchRowMetrics: mocks.sync }));
vi.mock("@/lib/logger", () => ({ logger: { warn: vi.fn(), error: vi.fn() } }));

import { buildScoreboard } from "@/lib/competitors/scoreboard";
import { buildChangeFeed } from "@/lib/competitors/change-feed";
import { fetchCompetitorMetricsFromGoogle } from "@/services/competitors/live-metrics";
import { processCompetitorWatchRow } from "@/services/cron/competitor-watch-process-row";
import type { CompetitorWatchScanState } from "@/services/cron/competitor-watch-types";

afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    mocks.sync.mockReset();
});

describe("scoreboard ties", () => {
    it("says tied instead of #2 when you share the top rating", () => {
        const board = buildScoreboard({
            own: { name: "You", rating: 4.6, totalReviews: 100, newReviews: 2 },
            competitors: [{ id: "a", name: "Taj", rating: 4.6, totalReviews: 900, newReviews: 9 }],
        }, "30 Days");
        expect(board.headline).toBe("You're tied for the best Google rating of 2 businesses");
    });
});

describe("change feed limit", () => {
    it("never drops an alert to make room, only ordinary changes", () => {
        const ticks = Array.from({ length: 20 }, (_, i) => ({
            id: `t${i}`, competitor_id: "a", event_type: "competitor.rating_changed", event_value: 4.2, event_delta: 0.1,
            created_at: `2026-10-${String(21 - (i % 20)).padStart(2, "0")}T10:00:00.000Z`,
        }));
        const oldAlert = { id: "alert", competitor_id: "b", event_type: "competitor.alert.review_spike", event_value: 300, event_delta: 25, created_at: "2026-09-01T10:00:00.000Z" };
        const feed = buildChangeFeed([...ticks, oldAlert], new Map([["a", "Taj"], ["b", "Curry"]]), 5);
        expect(feed.filter((f) => !f.isAlert)).toHaveLength(5);
        expect(feed.some((f) => f.id === "alert")).toBe(true);
    });
});

describe("exact Google place lookup", () => {
    it("falls back to the name search when the picked place no longer exists", async () => {
        vi.stubEnv("GOOGLE_MAPS_API_KEY", "test-key");
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(new Response("not found", { status: 404 }))
            .mockResolvedValueOnce(new Response(JSON.stringify({ places: [{ id: "NEW", rating: 4.3, userRatingCount: 50 }] }), { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);
        const result = await fetchCompetitorMetricsFromGoogle({
            name: "Taj Palace", googleUrl: "https://www.google.com/maps/search/?api=1&query_place_id=ChIJoldplace1234", retries: 0,
        });
        expect(fetchMock.mock.calls[0][0]).toContain("/v1/places/ChIJoldplace1234");
        expect(fetchMock.mock.calls[1][0]).toContain("places:searchText");
        expect(result).toMatchObject({ averageRating: 4.3, totalReviews: 50, placeId: "NEW" });
    });
});

describe("switching to the exact place", () => {
    function state(previousPlace: string | null) {
        return {
            now: new Date("2026-10-22T08:00:00.000Z"),
            latestByCompetitor: new Map([["c", { id: "s", competitor_id: "c", captured_at: "2026-10-21T08:00:00.000Z", average_rating: 3.9, total_reviews: 40, provider_place_id: previousPlace }]]),
            settingsByBusiness: new Map([["biz", { rating_alert_delta: 0.2, review_spike_threshold: 20, email_alerts_enabled: true }]]),
            orgByBusiness: new Map([["biz", "org"]]),
            recentByCompetitor: new Map(),
            eventsToInsert: [], appEventsToInsert: [], alertEmailQueue: [], insightInputByCompetitor: new Map(),
        } as unknown as CompetitorWatchScanState;
    }
    const competitor = { id: "c", business_id: "biz", name: "Taj", average_rating: 3.9, total_reviews: 40, google_url: null };

    it("treats a different Google place as a new starting point: no alerts or emails", async () => {
        mocks.sync.mockResolvedValue({ skip: false, currRating: 4.6, currReviews: 1240, ratingDelta: 0.7, reviewsDelta: 1200, provider: "google_places", providerPlaceId: "EXACT" });
        const s = state("WRONG_BRANCH");
        await processCompetitorWatchRow(s, competitor);
        expect(s.eventsToInsert).toEqual([]);
        expect(s.alertEmailQueue).toEqual([]);
    });

    it("still alerts when it is the same place as before", async () => {
        mocks.sync.mockResolvedValue({ skip: false, currRating: 4.2, currReviews: 40, ratingDelta: 0.3, reviewsDelta: 0, provider: "google_places", providerPlaceId: "SAME" });
        const s = state("SAME");
        await processCompetitorWatchRow(s, competitor);
        expect(s.alertEmailQueue.map((a) => a.eventType)).toEqual(["competitor.alert.rating_surge"]);
    });
});
