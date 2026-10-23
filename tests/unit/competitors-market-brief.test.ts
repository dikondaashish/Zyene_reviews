import { describe, expect, it } from "vitest";
import { parseCompetitorsMarketBrief } from "@/app/(dashboard)/competitors/competitors-market-brief";

describe("parseCompetitorsMarketBrief", () => {
    it("returns null for missing briefs or briefs without an id", () => {
        expect(parseCompetitorsMarketBrief(null)).toBeNull();
        expect(parseCompetitorsMarketBrief({ headline: "No id" })).toBeNull();
    });

    it("normalizes a complete brief", () => {
        const result = parseCompetitorsMarketBrief({
            id: 42,
            headline: "You lead on rating",
            overview: "Overview text",
            positioning_bullets: ["Fast replies", "More reviews"],
            opportunity_actions: [{ title: "Ask more", detail: "Send requests weekly" }],
            data_limitations: "Yelp unavailable",
            model: "claude",
            created_at: "2026-10-01T00:00:00.000Z",
        });

        expect(result).toEqual({
            id: "42",
            headline: "You lead on rating",
            overview: "Overview text",
            positioning_bullets: ["Fast replies", "More reviews"],
            opportunity_actions: [{ title: "Ask more", detail: "Send requests weekly" }],
            data_limitations: "Yelp unavailable",
            model: "claude",
            created_at: "2026-10-01T00:00:00.000Z",
        });
    });

    it("drops empty bullets and incomplete actions, trimming kept actions", () => {
        const result = parseCompetitorsMarketBrief({
            id: "b1",
            positioning_bullets: ["Keep", "", null, undefined, 7],
            opportunity_actions: [
                { title: "  Title  ", detail: "  Detail  " },
                { title: "Missing detail" },
                { detail: "Missing title" },
                { title: "   ", detail: "Blank title" },
            ],
        });

        expect(result?.positioning_bullets).toEqual(["Keep", "7"]);
        expect(result?.opportunity_actions).toEqual([{ title: "Title", detail: "Detail" }]);
    });

    it("defaults missing fields and non-array lists", () => {
        const result = parseCompetitorsMarketBrief({
            id: "b2",
            positioning_bullets: "not an array",
            opportunity_actions: { title: "not an array" },
        });

        expect(result).toEqual({
            id: "b2",
            headline: "",
            overview: "",
            positioning_bullets: [],
            opportunity_actions: [],
            data_limitations: null,
            model: null,
            created_at: "",
        });
    });
});
