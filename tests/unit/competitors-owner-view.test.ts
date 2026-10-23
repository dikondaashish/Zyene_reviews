import { describe, expect, it } from "vitest";
import { buildScoreboard } from "@/lib/competitors/scoreboard";
import { buildChangeFeed, describeCompetitorEvent } from "@/lib/competitors/change-feed";
import { placeIdFromGoogleUrl } from "@/services/competitors/live-metrics";
import { recordCompetitorWatchRowEvents } from "@/services/cron/competitor-watch-row-events";
import type { CompetitorWatchScanState } from "@/services/cron/competitor-watch-types";

describe("buildScoreboard", () => {
    const own = { name: "Vindu", rating: 4.5, totalReviews: 214, newReviews: 8 };
    const competitors = [
        { id: "a", name: "Taj Palace", rating: 4.6, totalReviews: 1240, newReviews: 22 },
        { id: "b", name: "Curry House", rating: 4.4, totalReviews: 512, newReviews: 3 },
    ];

    it("ranks on all-time Google rating, like for like, with you included", () => {
        const board = buildScoreboard({ own, competitors }, "30 Days");
        expect(board.rows.map((r) => r.name)).toEqual(["Taj Palace", "Vindu", "Curry House"]);
        expect(board.headline).toBe("You're #2 of 3 on Google rating");
    });

    it("explains the review gap and the pace in plain sentences", () => {
        const board = buildScoreboard({ own, competitors }, "30 Days");
        expect(board.details).toEqual([
            "Taj Palace has about 5.8× as many reviews as you.",
            "In the last 30 days, Taj Palace gained 22 reviews; you gained 8.",
        ]);
    });

    it("names every competitor gaining reviews faster, even ones ranked below you on rating", () => {
        const board = buildScoreboard({
            own: { name: "Wolfpack BBQ", rating: 4.7, totalReviews: 1464, newReviews: 150 },
            competitors: [
                { id: "j", name: "Joe's KC BBQ", rating: 4.8, totalReviews: 18224, newReviews: 435 },
                { id: "a", name: "Arthur Bryant's Barbeque", rating: 4.2, totalReviews: 10029, newReviews: 160 },
                { id: "g", name: "Gates Bar-B-Q", rating: 4.0, totalReviews: 4249, newReviews: 67 },
            ],
        }, "90 Days");
        expect(board.headline).toBe("You're #2 of 4 on Google rating");
        expect(board.rows.map((r) => r.name)).toEqual(["Joe's KC BBQ", "Wolfpack BBQ", "Arthur Bryant's Barbeque", "Gates Bar-B-Q"]);
        expect(board.details[1]).toBe(
            "In the last 90 days, 2 competitors got more new reviews than you (Joe's KC BBQ +435, Arthur Bryant's Barbeque +160); you gained 150.",
        );
    });

    it("celebrates the lead without overclaiming", () => {
        const board = buildScoreboard({ own: { ...own, rating: 4.9, totalReviews: 2000, newReviews: 40 }, competitors }, "7 Days");
        expect(board.headline).toBe("You have the best Google rating of 3 businesses");
        expect(board.details).toEqual([
            "You have at least as many reviews as any competitor you track.",
            "In the last 7 days, you gained at least as many new reviews as any competitor.",
        ]);
    });

    it("says so when ratings have not loaded instead of ranking you #1 of 1", () => {
        const board = buildScoreboard({ own, competitors: [{ id: "a", name: "New Place", rating: null, totalReviews: null, newReviews: null }] }, "30 Days");
        expect(board.headline).toBe("Your competitors' ratings haven't loaded yet");
    });
});

describe("change feed", () => {
    const base = { competitor_id: "a", created_at: "2026-10-20T08:00:00.000Z" };

    it("hides routine review ticks and keeps bigger jumps", () => {
        expect(describeCompetitorEvent({ ...base, id: "1", event_type: "competitor.review_count_changed", event_value: 100, event_delta: 2 }, "Taj")).toBeNull();
        expect(describeCompetitorEvent({ ...base, id: "2", event_type: "competitor.review_count_changed", event_value: 100, event_delta: 6 }, "Taj")?.text).toBe("Taj gained 6 reviews.");
    });

    it("keeps only the alert when an alert and its plain change describe the same move", () => {
        const feed = buildChangeFeed([
            { ...base, id: "1", event_type: "competitor.rating_changed", event_value: 4.2, event_delta: -0.2 },
            { ...base, id: "2", event_type: "competitor.alert.rating_drop", event_value: 4.2, event_delta: -0.2 },
        ], new Map([["a", "Taj"]]));
        expect(feed).toHaveLength(1);
        expect(feed[0]).toMatchObject({ isAlert: true, tone: "down" });
        expect(feed[0].text).toContain("Taj's rating dropped by 0.2 to 4.2★");
    });
});

describe("placeIdFromGoogleUrl", () => {
    it.each([
        ["https://www.google.com/maps/search/?api=1&query_place_id=ChIJN1t_tDeuEmsRUsoyG83frY4", "ChIJN1t_tDeuEmsRUsoyG83frY4"],
        ["https://www.google.com/maps/place/?q=place_id:ChIJN1t_tDeuEmsRUsoyG83frY4", "ChIJN1t_tDeuEmsRUsoyG83frY4"],
        ["https://maps.google.com/?cid=1234567890", null],
        [null, null],
    ])("%s -> %s", (url, id) => {
        expect(placeIdFromGoogleUrl(url)).toBe(id);
    });
});

describe("competitor alerts", () => {
    function scan(ratingDelta: number, reviewsDelta: number) {
        const state = {
            now: new Date("2026-10-22T08:00:00.000Z"),
            settingsByBusiness: new Map([["biz", { rating_alert_delta: 0.2, review_spike_threshold: 20, email_alerts_enabled: true }]]),
            orgByBusiness: new Map([["biz", "org"]]),
            eventsToInsert: [], appEventsToInsert: [], alertEmailQueue: [], insightInputByCompetitor: new Map(),
        } as unknown as CompetitorWatchScanState;
        recordCompetitorWatchRowEvents(state, { id: "c", business_id: "biz", name: "Taj", average_rating: 4.4, total_reviews: 100 }, {
            hasLatest: true, currRating: 4.4 + ratingDelta, currReviews: 100 + reviewsDelta, ratingDelta, reviewsDelta, provider: "google_places", prevRating: 4.4, prevReviews: 100,
        });
        return state;
    }

    it("alerts and emails when a competitor's rating drops past the threshold", () => {
        const state = scan(-0.3, 0);
        expect(state.eventsToInsert.map((e) => e.event_type)).toContain("competitor.alert.rating_drop");
        expect(state.alertEmailQueue.map((e) => e.eventType)).toEqual(["competitor.alert.rating_drop"]);
    });

    it("still alerts on rises and review bursts", () => {
        expect(scan(0.3, 0).alertEmailQueue.map((e) => e.eventType)).toEqual(["competitor.alert.rating_surge"]);
        expect(scan(0, 25).alertEmailQueue.map((e) => e.eventType)).toEqual(["competitor.alert.review_spike"]);
    });

    it("does not ask the AI for a write-up on a routine +1 review day", () => {
        expect(scan(0, 1).insightInputByCompetitor.size).toBe(0);
        expect(scan(0, 6).insightInputByCompetitor.size).toBe(1);
        expect(scan(-0.1, 0).insightInputByCompetitor.size).toBe(1);
    });
});
