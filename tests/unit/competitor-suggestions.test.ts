import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.hoisted(() => vi.fn());
const redisMock = vi.hoisted(() => ({ get: vi.fn(), set: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/http/fetch-with-timeout", () => ({ fetchWithTimeout: fetchMock }));
vi.mock("@/lib/db/redis", () => ({ redis: redisMock }));

const { lookupCompetitorSuggestions, ownPlaceIdFromUrls, toSuggestion, withoutTracked } = await import("@/lib/competitors/competitor-suggestions");

const OWN = { id: "ChIJownOwnOwnOwn1", displayName: { text: "Taj Palace" }, primaryType: "indian_restaurant", types: ["indian_restaurant", "restaurant"], location: { latitude: 39.1, longitude: -94.58 } };
const place = (id: string, name: string, reviews: number, extra: object = {}) => ({
    id, displayName: { text: name }, rating: 4.46, userRatingCount: reviews, primaryType: "indian_restaurant",
    types: ["indian_restaurant"], location: { latitude: 39.11, longitude: -94.58 }, shortFormattedAddress: "12 Main St, Kansas City", ...extra,
});
const ok = (body: unknown) => ({ ok: true, json: async () => body });

beforeEach(() => {
    fetchMock.mockReset(); redisMock.get.mockReset(); redisMock.set.mockReset().mockResolvedValue("OK");
    vi.stubEnv("GOOGLE_MAPS_API_KEY", "test-key");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", ""); vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
});
afterEach(() => vi.unstubAllEnvs());

describe("ownPlaceIdFromUrls", () => {
    it("reads the place id from a review link or a Maps link", () => {
        expect(ownPlaceIdFromUrls(["https://search.google.com/local/writereview?placeid=ChIJabc1234567"])).toBe("ChIJabc1234567");
        expect(ownPlaceIdFromUrls([null, "https://www.google.com/maps/search/?api=1&query=X&query_place_id=ChIJxyz1234567"])).toBe("ChIJxyz1234567");
        expect(ownPlaceIdFromUrls(["https://g.page/r/ChIJpasted12345/review"])).toBe("ChIJpasted12345");
    });
    it("returns null when no link carries one", () => {
        expect(ownPlaceIdFromUrls([null, "", "https://g.page/r/abc/review"])).toBeNull();
    });
});

describe("toSuggestion", () => {
    it("rounds the rating, converts distance to miles and links to the Maps profile", () => {
        const s = toSuggestion(OWN, place("ChIJa111111111", "Spice Route", 912))!;
        expect(s).toMatchObject({ placeId: "ChIJa111111111", name: "Spice Route", rating: 4.5, reviews: 912, address: "12 Main St, Kansas City" });
        expect(s.distanceMiles).toBeCloseTo(0.7, 1);
        const maps = new URL(s.mapsUrl).searchParams;
        expect(maps.get("query")).toBe("Spice Route");
        expect(maps.get("query_place_id")).toBe("ChIJa111111111");
    });
    it("skips places without an id or a name", () => {
        expect(toSuggestion(OWN, { displayName: { text: "X" } })).toBeNull();
        expect(toSuggestion(OWN, { id: "ChIJ1", displayName: { text: " " } })).toBeNull();
    });
});

describe("withoutTracked", () => {
    const list = ["Spice Route", "Curry House", "Taj Palace"].map((name, i) => toSuggestion(OWN, place(`ChIJs${i}0000000000`, name, 100))!);
    it("leaves out businesses already tracked, by place id or by name, and the owner's own", () => {
        const kept = withoutTracked(list, [
            { name: "Something else", google_url: "https://www.google.com/maps/search/?api=1&query_place_id=ChIJs00000000000" },
            { name: "curry house", google_url: null },
        ], { name: "Taj Palace", placeId: OWN.id });
        expect(kept).toEqual([]);
    });
    it("keeps everything when nothing matches", () => {
        expect(withoutTracked(list, [], { name: "Other Place", placeId: null })).toHaveLength(3);
    });
});

describe("lookupCompetitorSuggestions", () => {
    const input = { businessId: "biz", name: "Taj Palace", city: "Kansas City", placeId: OWN.id };

    it("looks up the owner's listing, then nearby places in the same category, most-reviewed first", async () => {
        fetchMock.mockResolvedValueOnce(ok(OWN)).mockResolvedValueOnce(ok({ places: [
            place("ChIJsmall0000000", "Small Curry", 40), OWN, place("ChIJbig00000000", "Big Curry", 900),
            place("ChIJpizza000000", "Pizza Co", 5000, { primaryType: "pizza_restaurant", types: ["pizza_restaurant"] }),
        ] }));
        const result = await lookupCompetitorSuggestions(input);
        expect(result.status).toBe("ok");
        expect(result.status === "ok" && result.suggestions.map((s) => s.name)).toEqual(["Big Curry", "Small Curry"]);
        expect(String(fetchMock.mock.calls[0][0])).toContain(`/places/${OWN.id}`);
        expect(JSON.parse(fetchMock.mock.calls[1][1].body).includedTypes).toEqual(["indian_restaurant"]);
    });

    it("finds the owner by name and city when no link carries a place id", async () => {
        fetchMock.mockResolvedValueOnce(ok({ places: [OWN] })).mockResolvedValueOnce(ok({ places: [place("ChIJbig00000000", "Big Curry", 900)] }));
        const result = await lookupCompetitorSuggestions({ ...input, placeId: null });
        expect(JSON.parse(fetchMock.mock.calls[0][1].body).textQuery).toBe("Taj Palace Kansas City");
        expect(result.status === "ok" && result.suggestions).toHaveLength(1);
    });

    it("says there's no listing when it has neither a place id nor a city", async () => {
        expect(await lookupCompetitorSuggestions({ ...input, placeId: null, city: null })).toEqual({ status: "no_listing" });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("says there's no listing when Google can't find the owner", async () => {
        fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
        expect(await lookupCompetitorSuggestions(input)).toEqual({ status: "no_listing" });
    });

    it("is unavailable without an API key or when Google errors", async () => {
        vi.stubEnv("GOOGLE_MAPS_API_KEY", ""); vi.stubEnv("GOOGLE_API_KEY", "");
        expect(await lookupCompetitorSuggestions(input)).toEqual({ status: "unavailable" });
        vi.stubEnv("GOOGLE_MAPS_API_KEY", "test-key");
        fetchMock.mockRejectedValueOnce(new Error("timeout"));
        expect(await lookupCompetitorSuggestions(input)).toEqual({ status: "unavailable" });
    });

    it("serves a cached list for a day without calling Google, and refetches when the listing changes", async () => {
        vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.test"); vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "t");
        const cached = { key: OWN.id, suggestions: [toSuggestion(OWN, place("ChIJbig00000000", "Big Curry", 900))] };
        redisMock.get.mockResolvedValueOnce(cached);
        expect(await lookupCompetitorSuggestions(input)).toEqual({ status: "ok", suggestions: cached.suggestions });
        expect(fetchMock).not.toHaveBeenCalled();

        redisMock.get.mockResolvedValueOnce({ ...cached, key: "ChIJoldlisting00" });
        fetchMock.mockResolvedValueOnce(ok(OWN)).mockResolvedValueOnce(ok({ places: [] }));
        await lookupCompetitorSuggestions(input);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(redisMock.set).toHaveBeenCalledWith("competitor_suggestions_v1:biz", { key: OWN.id, suggestions: [] }, { ex: 86400 });
    });
});
