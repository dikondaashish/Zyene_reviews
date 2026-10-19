import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/http/fetch-with-timeout", () => ({ fetchWithTimeout: fetchMock }));

import {
    categoryKeywords,
    findComparableCompetitors,
    isComparable,
    specificPlaceType,
    type BusinessProfile,
    type PlaceCandidate,
} from "@/lib/support-chat/tools/reputation-competitors";

const here = { latitude: 42.044, longitude: -71.552 };
const near = (dLat = 0.01) => ({ latitude: here.latitude + dLat, longitude: here.longitude });

const vapeShop: BusinessProfile = {
    id: "vape",
    displayName: { text: "Mendon Vape & Smoke Shop" },
    rating: 4.4,
    userRatingCount: 16,
    primaryType: "store",
    types: ["store", "point_of_interest", "establishment"],
    location: here,
    addressComponents: [{ longText: "Mendon", types: ["locality", "political"] }],
};

const place = (id: string, primaryType: string, reviews: number, extra: Partial<PlaceCandidate> = {}): PlaceCandidate => ({
    id, displayName: { text: id }, rating: 4.5, userRatingCount: reviews, primaryType, types: [primaryType, "store"], location: near(), ...extra,
});

const respond = (places: PlaceCandidate[]) => ({ ok: true, json: async () => ({ places }) });

beforeEach(() => fetchMock.mockReset());

describe("category detection", () => {
    it("treats store as generic and finds no specific type for a plain shop", () => {
        expect(specificPlaceType(vapeShop)).toBeNull();
    });

    it("uses a specific secondary type when the primary one is generic", () => {
        expect(specificPlaceType({ primaryType: "store", types: ["store", "pet_store"] })).toBe("pet_store");
    });

    it("describes the business by its own name, minus the town", () => {
        expect(categoryKeywords(vapeShop)).toEqual(["vape", "smoke", "shop"]);
    });
});

describe("findComparableCompetitors", () => {
    it("never compares a vape shop with car dealers (the reported bug)", async () => {
        fetchMock.mockResolvedValueOnce(respond([
            place("Imperial Chevrolet", "car_dealer", 1935),
            place("Imperial Ford", "car_dealer", 1428),
            place("Cloud 9 Vapes", "store", 210),
            place("Smoke Spot", "store", 95),
        ]));
        const result = await findComparableCompetitors("key", vapeShop);
        expect(result.map((p) => p.id)).toEqual(["Cloud 9 Vapes", "Smoke Spot"]);
        // Generic businesses are found by keyword text search, not by the useless "store" type.
        expect(String(fetchMock.mock.calls[0][0])).toContain("searchText");
        expect(JSON.parse(fetchMock.mock.calls[0][1].body).textQuery).toBe("vape smoke shop");
    });

    it("searches nearby by a specific type and keeps only exact category matches", async () => {
        const cafe: BusinessProfile = { ...vapeShop, id: "cafe", primaryType: "coffee_shop", types: ["coffee_shop", "cafe", "store"] };
        fetchMock.mockResolvedValueOnce(respond([
            place("Bean There", "coffee_shop", 214),
            place("Gas & Go", "gas_station", 900),
            place("cafe", "coffee_shop", 50), // the business itself
        ]));
        const result = await findComparableCompetitors("key", cafe);
        expect(result.map((p) => p.id)).toEqual(["Bean There"]);
        expect(JSON.parse(fetchMock.mock.calls[0][1].body).includedTypes).toEqual(["coffee_shop"]);
    });

    it("returns nothing rather than a wrong comparison when no keywords or matches exist", async () => {
        expect(await findComparableCompetitors("key", { ...vapeShop, displayName: { text: "Mendon" } })).toEqual([]);
        expect(fetchMock).not.toHaveBeenCalled();
    });
});

describe("isComparable", () => {
    it("drops businesses too far away to be local competition", () => {
        expect(isComparable(vapeShop, place("Far Vapes", "store", 300, { location: near(0.5) }), null)).toBe(false);
        expect(isComparable(vapeShop, place("Near Vapes", "store", 300), null)).toBe(true);
    });
});
