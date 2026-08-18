import { redirect } from "next/navigation";

import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { isLiveSamplingEnabled } from "@/lib/features/aeo-surfaces";
import { maxGeoGridSizeForPlan, type GeoGridSize } from "@/services/aeo/geo-grid/geo-grid-plan";
import { assertAeoQueriesSucceeded } from "@/services/aeo/query-results";

export type GeoGridPoint = {
    row: number;
    col: number;
    /** Null means "searched, not found in the local pack" — never rendered as a rank. */
    rankPosition: number | null;
    searchStatus: "searched" | "failed";
    topCompetitors: { position: number; name: string; placeId: string | null }[];
};

export type GeoGridRun = {
    id: string;
    keyword: string;
    gridSize: number;
    spacingMeters: number;
    status: string;
    errorMessage: string | null;
    createdAt: string;
    completedAt: string | null;
    points: GeoGridPoint[];
    /** Average of found ranks only. Null when nothing ranked. */
    averageRank: number | null;
    foundCells: number;
    /** Cells Google answered for — excludes cells whose search failed. */
    searchedCells: number;
    estimatedCostMicroUsd: number;
    actualCostMicroUsd: number | null;
};

export type GeoGridPageData =
    | { kind: "no-business" }
    | {
          kind: "ok";
          businessId: string;
          businessName: string;
          liveSamplingEnabled: boolean;
          maxGridSize: GeoGridSize | 0;
          latestRun: GeoGridRun | null;
      };

export async function loadGeoGridPageData(): Promise<GeoGridPageData> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { businessId, business, organization } = await getActiveBusinessId();
    if (!businessId || !business) return { kind: "no-business" };

    const runResult = await supabase
        .from("aeo_geo_grid_runs")
        .select("id, keyword, grid_size, spacing_meters, status, error_message, created_at, completed_at, estimated_cost_micro_usd, actual_cost_micro_usd")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
    assertAeoQueriesSucceeded("Unable to load AEO geo-grid run", runResult);
    const runRow = runResult.data;

    let latestRun: GeoGridRun | null = null;

    if (runRow) {
        const pointResult = await supabase
            .from("aeo_geo_grid_points")
            .select("grid_row, grid_col, rank_position, search_status, top_competitors")
            .eq("run_id", runRow.id);
        assertAeoQueriesSucceeded("Unable to load AEO geo-grid points", pointResult);
        const pointRows = pointResult.data;

        const points = (pointRows ?? []).map((p) => ({
            row: p.grid_row,
            col: p.grid_col,
            rankPosition: p.rank_position,
            searchStatus: p.search_status as "searched" | "failed",
            topCompetitors: (p.top_competitors ?? []) as GeoGridPoint["topCompetitors"],
        }));

        const searched = points.filter((p) => p.searchStatus === "searched");
        const found = searched.filter((p) => p.rankPosition !== null);
        // Averaged over found cells only. Including not-found cells as a zero
        // or a floor would invent a rank for a cell that had none.
        const averageRank =
            found.length > 0
                ? found.reduce((sum, p) => sum + (p.rankPosition ?? 0), 0) / found.length
                : null;

        latestRun = {
            id: runRow.id,
            keyword: runRow.keyword,
            gridSize: runRow.grid_size,
            spacingMeters: runRow.spacing_meters,
            status: runRow.status,
            errorMessage: runRow.error_message,
            createdAt: runRow.created_at,
            completedAt: runRow.completed_at,
            points,
            averageRank,
            foundCells: found.length,
            searchedCells: searched.length,
            estimatedCostMicroUsd: runRow.estimated_cost_micro_usd,
            actualCostMicroUsd: runRow.actual_cost_micro_usd,
        };
    }

    return {
        kind: "ok",
        businessId,
        businessName: business.name ?? "this business",
        liveSamplingEnabled: isLiveSamplingEnabled(),
        maxGridSize: maxGeoGridSizeForPlan(organization?.plan, organization?.plan_status),
        latestRun,
    };
}
