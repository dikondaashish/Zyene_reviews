import { afterEach, describe, expect, it, vi } from "vitest";

import { runGeoGrid } from "../../src/services/aeo/geo-grid/geo-grid-runner";

const INPUT = {
    centerLat: 38.9717,
    centerLng: -95.2353,
    size: 7 as const,
    spacingMeters: 805,
    keyword: "plumber",
    aliases: ["Acme Plumbing"],
    placeId: "place-acme",
    concurrency: 7,
};

function dataForSeoResponse(items: unknown[] = [], cost = 0.002): Response {
    return new Response(JSON.stringify({
        status_code: 20000,
        cost,
        tasks: [{ status_code: 20000, result: [{ items }] }],
    }), { status: 200, headers: { "content-type": "application/json" } });
}

afterEach(() => vi.unstubAllGlobals());

describe("runGeoGrid", () => {
    it("runs exactly 49 measured searches for a 7 by 7 grid", async () => {
        const fetchMock = vi.fn(async () => dataForSeoResponse([
            { type: "maps_search", rank_group: 4, title: "Acme Plumbing", place_id: "place-acme" },
        ]));
        vi.stubGlobal("fetch", fetchMock);

        const outcome = await runGeoGrid(INPUT, { login: "login", password: "password" });

        expect(fetchMock).toHaveBeenCalledTimes(49);
        expect(outcome).toMatchObject({
            status: "success",
            totalCells: 49,
            billedRequests: 49,
            costMicroUsd: 98_000,
            foundCells: 49,
            averageRank: 4,
        });
    });

    it("keeps a genuine top-20 absence as null", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => dataForSeoResponse([
            { type: "maps_search", rank_group: 1, title: "Competitor", place_id: "place-other" },
        ])));

        const outcome = await runGeoGrid(INPUT, { login: "login", password: "password" });

        expect(outcome.cells.every((cell) => cell.rankPosition === null && cell.error === null)).toBe(true);
        expect(outcome.foundCells).toBe(0);
    });

    it("persists a provider failure as a partial-run gap, not a not-found result", async () => {
        let call = 0;
        vi.stubGlobal("fetch", vi.fn(async () => {
            call += 1;
            return call === 8
                ? new Response("rate limited", { status: 429 })
                : dataForSeoResponse();
        }));

        const outcome = await runGeoGrid(INPUT, { login: "login", password: "password" });

        expect(outcome.status).toBe("partial");
        expect(outcome.failedCells).toBe(1);
        expect(outcome.cells.filter((cell) => cell.error !== null)).toHaveLength(1);
        expect(outcome.totalCells - outcome.failedCells).toBe(48);
    });
});
