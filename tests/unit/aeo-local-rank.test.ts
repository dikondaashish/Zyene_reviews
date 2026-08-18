import { describe, expect, it } from "vitest";

import { findLocalRank, readLocalPack } from "../../src/services/aeo/geo-grid/local-rank";

const PACK = [
    { type: "maps_search", rank_group: 1, title: "Radiant Plumbing, Air Conditioning, & Electrical", place_id: "place-radiant", rating: { value: 4.8, votes_count: 18000 } },
    { type: "maps_search", rank_group: 2, title: "We Plumb LLC", place_id: "place-we-plumb", rating: { value: 4.9, votes_count: 180 } },
    { type: "maps_search", rank_group: 3, title: "Austin's Greatest Plumbing", place_id: "place-austin", rating: { value: 5, votes_count: 298 } },
    { type: "organic", title: "not a local pack entry" },
];

describe("reading the local pack", () => {
    it("takes Maps/local-pack entries, in order", () => {
        const entries = readLocalPack(PACK);
        expect(entries).toHaveLength(3);
        expect(entries.map((e) => e.position)).toEqual([1, 2, 3]);
    });

    it("keeps ratings and review counts", () => {
        expect(readLocalPack(PACK)[0]).toMatchObject({
            placeId: "place-radiant",
            rating: 4.8,
            reviews: 18000,
        });
    });

    it("drops entries with no name rather than ranking a blank", () => {
        expect(readLocalPack([{ type: "local_pack", title: "  " }])).toHaveLength(0);
    });
});

describe("absence is null, never a sentinel", () => {
    /**
     * The predecessor to this number was computed from the business's star
     * rating, so every cell always had a rank. A business Google did not list
     * has NO rank, and scoring it is how "nearly invisible" reads as "mediocre".
     */
    it("returns null when the business is not in the pack", () => {
        const result = findLocalRank(readLocalPack(PACK), ["Zyene Plumbing"]);
        expect(result.rankPosition).toBeNull();
    });

    it("still reports who WAS listed, so the cell is not empty of information", () => {
        const result = findLocalRank(readLocalPack(PACK), ["Zyene Plumbing"]);
        expect(result.topCompetitors.map((c) => c.position)).toEqual([1, 2, 3]);
        expect(result.packSize).toBe(3);
    });
});

describe("matching a real Google listing", () => {
    it("uses the Google Place ID as the authoritative identity", () => {
        const result = findLocalRank(readLocalPack(PACK), ["A different name"], "place-we-plumb");
        expect(result.rankPosition).toBe(2);
        expect(result.placeIdFound).toBe("place-we-plumb");
    });

    it("does not accept a name collision when a Place ID is available", () => {
        const result = findLocalRank(readLocalPack(PACK), ["We Plumb LLC"], "another-place");
        expect(result.rankPosition).toBeNull();
        expect(result.placeIdFound).toBeNull();
    });

    it("matches when Google renders a longer trading name", () => {
        // Google lists "Radiant Plumbing, Air Conditioning, & Electrical" for a
        // business that calls itself "Radiant Plumbing". Strict equality would
        // report a #1 ranking business as absent.
        const result = findLocalRank(readLocalPack(PACK), ["Radiant Plumbing"]);
        expect(result.rankPosition).toBe(1);
    });

    it("matches when the business name is longer than the listing", () => {
        const result = findLocalRank(readLocalPack(PACK), ["We Plumb LLC of Austin"]);
        expect(result.rankPosition).toBe(2);
    });

    it("excludes the business itself from its own competitor list", () => {
        const result = findLocalRank(readLocalPack(PACK), ["Radiant Plumbing"]);
        expect(result.topCompetitors.some((c) => c.name.includes("Radiant"))).toBe(false);
    });

    it("ignores a name too short to be evidence", () => {
        const result = findLocalRank(readLocalPack(PACK), ["We"]);
        expect(result.rankPosition).toBeNull();
    });

    it("takes the best position if a business lists twice", () => {
        const dup = [
            { type: "local_pack", rank_group: 1, title: "Ace Plumbing" },
            { type: "local_pack", rank_group: 3, title: "Ace Plumbing" },
        ];
        expect(findLocalRank(readLocalPack(dup), ["Ace Plumbing"]).rankPosition).toBe(1);
    });

    it("is case and punctuation insensitive", () => {
        const result = findLocalRank(readLocalPack(PACK), ["austin's greatest plumbing"]);
        expect(result.rankPosition).toBe(3);
    });
});
