import { callDataForSeo, classifyDataForSeoStatus } from "../engines/adapters/dataforseo-client";
import { buildGrid, gridCoverage, type GridPoint, type GridSpec } from "./grid-geometry";
import { findLocalRank, readLocalPack, type LocalRankResult } from "./local-rank";

/**
 * PRD-5 geo-grid: search the same keyword from N x N real coordinates and record
 * where the business actually ranks in each local pack.
 *
 * Replaces the heuristic heatmap, which never issued a search — it generated
 * cell labels from the business's city and a "rank" from its star rating. Every
 * number here comes from a request Google actually answered.
 *
 * Cost is the thing to respect: one grid is size^2 billed requests. A 9x9 is 81
 * requests, roughly $0.16 at DataForSEO's SERP rate. That is why the caller
 * supplies the spec rather than it being inferred, and why partial results are
 * kept rather than discarded on failure.
 */

export type GeoGridCell = GridPoint & LocalRankResult & {
    /** Set when this cell's search failed; rankPosition is then null-because-unknown. */
    error: string | null;
};

export type GeoGridOutcome = {
    cells: GeoGridCell[];
    averageRank: number | null;
    foundCells: number;
    totalCells: number;
    coveragePercent: number;
    /** Cells whose search failed. These are NOT counted as "not found". */
    failedCells: number;
    billedRequests: number;
    costMicroUsd: number;
    status: "success" | "partial" | "failed";
};

export type GeoGridInput = GridSpec & {
    keyword: string;
    languageCode?: string;
    /** Names the business is listed under. */
    aliases: readonly string[];
    /** Bounds concurrent vendor calls; DataForSEO rate-limits per account. */
    concurrency?: number;
};

export type GeoGridDeps = {
    login: string;
    password: string;
    signal?: AbortSignal;
};

const DEFAULT_CONCURRENCY = 5;

export async function runGeoGrid(
    input: GeoGridInput,
    deps: GeoGridDeps
): Promise<GeoGridOutcome> {
    const points = buildGrid(input);
    const cells: GeoGridCell[] = new Array(points.length);
    let billedRequests = 0;
    let costMicroUsd = 0;

    const limit = Math.max(1, input.concurrency ?? DEFAULT_CONCURRENCY);
    let cursor = 0;

    async function worker() {
        while (cursor < points.length) {
            const index = cursor;
            cursor += 1;
            const point = points[index];

            const call = await callDataForSeo(
                "/serp/google/organic/live/advanced",
                {
                    keyword: input.keyword,
                    language_code: input.languageCode ?? "en",
                    // The whole point of the grid: search FROM this coordinate.
                    location_coordinate: `${point.lat},${point.lng}`,
                    depth: 10,
                },
                { login: deps.login, password: deps.password },
                deps.signal ?? AbortSignal.timeout(120_000)
            );

            if (call.costUsd !== undefined) {
                costMicroUsd += Math.round(call.costUsd * 1_000_000);
            }
            if (call.httpStatus !== 0) billedRequests += 1;

            if (!call.ok) {
                const { kind } = classifyDataForSeoStatus(call.taskStatusCode ?? call.statusCode);
                // A failed cell is UNKNOWN, not "business absent". Recording it
                // as not-found would let a rate limit render as a coverage drop.
                cells[index] = {
                    ...point,
                    rankPosition: null,
                    topCompetitors: [],
                    packSize: 0,
                    error: call.error ?? kind,
                };
                continue;
            }

            const pack = readLocalPack(call.result?.items ?? []);
            cells[index] = { ...point, ...findLocalRank(pack, input.aliases), error: null };
        }
    }

    await Promise.all(Array.from({ length: Math.min(limit, points.length) }, worker));

    const failedCells = cells.filter((c) => c.error !== null).length;
    // Failed cells are excluded from the denominator entirely: coverage is a
    // statement about where the business ranks, and a cell we could not search
    // says nothing either way.
    const coverage = gridCoverage(
        cells.filter((c) => c.error === null).map((c) => c.rankPosition)
    );

    return {
        cells,
        ...coverage,
        failedCells,
        billedRequests,
        costMicroUsd,
        status:
            failedCells === 0 ? "success" : failedCells === cells.length ? "failed" : "partial",
    };
}
