import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DataForSeoSerpAdapter } from "../../src/services/aeo/engines/adapters/dataforseo-serp-adapter";
import type { EngineSampleRequest } from "../../src/services/aeo/engines/engine-types";
import {
    resolveCountryName,
    resolveRegionName,
} from "../../src/services/aeo/locale/region-names";

/**
 * Covers the second bug the first live DataForSEO run exposed: the adapter sent
 * `location_name: "Kansas City"`, DataForSEO answered 40501 "Invalid Field", and
 * all ten Google samples failed while still consuming a unit each.
 *
 * Both rejected shapes are asserted against the real API's behaviour, verified
 * on 2026-08-07:
 *   "Kansas City"                        -> 40501
 *   "Kansas City,MO,United States"       -> 40501
 *   "Kansas City,Missouri,United States" -> 20000
 */

describe("resolveRegionName", () => {
    it("expands a state code to the name search vendors accept", () => {
        expect(resolveRegionName("US", "MO")).toBe("Missouri");
        expect(resolveRegionName("US", "ks")).toBe("Kansas");
    });

    it("passes through a value already stored as a full name", () => {
        expect(resolveRegionName("US", "Missouri")).toBe("Missouri");
    });

    it("returns undefined rather than guessing for an unknown code", () => {
        expect(resolveRegionName("US", "ZZ")).toBeUndefined();
        expect(resolveRegionName("US", "")).toBeUndefined();
        expect(resolveRegionName("US", null)).toBeUndefined();
    });

    it("refuses non-US subdivisions, whose codes collide with US states", () => {
        // Victoria (AU) and Virginia (US) are both "VA"; mapping either from a
        // bare code would put the search in the wrong hemisphere.
        expect(resolveRegionName("AU", "VA")).toBeUndefined();
    });

    it("states a country name only where it knows one", () => {
        expect(resolveCountryName("US")).toBe("United States");
        expect(resolveCountryName("us")).toBe("United States");
        expect(resolveCountryName("AU")).toBeUndefined();
    });
});

const fetchMock = vi.fn();

beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(
        new Response(
            JSON.stringify({
                status_code: 20000,
                cost: 0.002,
                tasks: [{ status_code: 20000, result: [{ items: [] }] }],
            }),
            { status: 200, headers: { "content-type": "application/json" } }
        )
    );
    vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

function sentBody(): Record<string, unknown> {
    const [, init] = fetchMock.mock.calls[0] as [string, { body: string }];
    return (JSON.parse(init.body) as Record<string, unknown>[])[0];
}

async function sampleWith(locale: EngineSampleRequest["locale"]) {
    const adapter = new DataForSeoSerpAdapter({ login: "u", password: "p" });
    await adapter.sample({ prompt: "best bbq", locale, attempt: 1 });
    return sentBody();
}

describe("the location DataForSEO is actually sent", () => {
    it("qualifies a city with its region and country", async () => {
        const body = await sampleWith({
            country: "US",
            language: "en",
            city: "Kansas City",
            region: "Missouri",
        });
        expect(body.location_name).toBe("Kansas City,Missouri,United States");
    });

    it("never sends a bare city — the exact shape the API rejects", async () => {
        const body = await sampleWith({ country: "US", language: "en", city: "Kansas City" });
        expect(body.location_name).toBeUndefined();
        expect(body.location_code).toBe(2840);
    });

    it("widens to the country when the region is unknown, rather than guessing", async () => {
        // There is a Kansas City in Kansas too. A country-wide result is visibly
        // less precise; a confidently wrong metro is not.
        const body = await sampleWith({ country: "US", language: "en", city: "Kansas City" });
        expect(body.location_code).toBe(2840);
    });

    it("prefers an explicit coordinate over any name", async () => {
        const body = await sampleWith({
            country: "US",
            language: "en",
            city: "Kansas City",
            region: "Missouri",
            coordinate: { lat: 39.0997, lng: -94.5786 },
        });
        expect(body.location_coordinate).toBe("39.0997,-94.5786");
        expect(body.location_name).toBeUndefined();
    });

    it("refuses a country it cannot place instead of searching America", async () => {
        // The country fallback is the US location code. Applying it to an
        // Australian business would run the search in the wrong country and
        // report the resulting miss as absence.
        const adapter = new DataForSeoSerpAdapter({ login: "u", password: "p" });
        const result = await adapter.sample({
            prompt: "best bbq",
            locale: { country: "AU", language: "en", city: "Melbourne", region: "Victoria" },
            attempt: 1,
        });

        expect(result.status).toBe("failed");
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("bills nothing for a search it refused to run", async () => {
        const adapter = new DataForSeoSerpAdapter({ login: "u", password: "p" });
        const result = await adapter.sample({
            prompt: "best bbq",
            locale: { country: "AU", language: "en" },
            attempt: 1,
        });
        expect(result.costUnits).toBe(0);
    });
});
