import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import type { GeoGridOutcome } from "./geo-grid-runner";

type Admin = SupabaseClient<Database>;

/**
 * Persists a geo-grid run.
 *
 * `is_estimated` is written FALSE, which is the whole point of this table
 * existing: the rows it replaces were written by a worker that never issued a
 * search. Every row here came from a coordinate Google actually answered.
 */
export class SupabaseGeoGridStore {
    constructor(private readonly db: Admin) {}

    async complete(input: {
        runId: string;
        businessId: string;
        outcome: GeoGridOutcome;
    }): Promise<{ runId: string; points: number }> {
        const { error: runError } = await this.db
            .from("aeo_geo_grid_runs")
            .update({
                status: input.outcome.status,
                actual_cost_micro_usd: input.outcome.costMicroUsd,
                billed_units: input.outcome.billedRequests,
                error_message:
                    input.outcome.failedCells > 0
                        ? `${input.outcome.failedCells} of ${input.outcome.cells.length} cells failed to search`
                        : null,
                completed_at: new Date().toISOString(),
            })
            .eq("id", input.runId)
            .eq("business_id", input.businessId);

        if (runError) throw new Error(`geo grid run update failed: ${runError.message}`);

        const { error: pointsError } = await this.db.from("aeo_geo_grid_points").upsert(
            input.outcome.cells.map((cell) => ({
                run_id: input.runId,
                business_id: input.businessId,
                grid_row: cell.row,
                grid_col: cell.col,
                lat: cell.lat,
                lng: cell.lng,
                /*
                 * NULL for both "searched, not in the local pack" and "search
                 * failed". They are different facts, and the difference lives in
                 * top_competitors: a searched cell records who WAS listed, a
                 * failed one records nothing. Never a sentinel rank — a 0 or a
                 * 20 would average into ATRP and turn "invisible here" into
                 * "mediocre here".
                 */
                rank_position: cell.rankPosition,
                place_id_found: cell.placeIdFound,
                top_competitors: cell.topCompetitors,
                search_status: cell.error === null ? "searched" : "failed",
                error_message: cell.error,
            })),
            { onConflict: "run_id,grid_row,grid_col" }
        );

        if (pointsError) throw new Error(`geo grid points insert failed: ${pointsError.message}`);

        return { runId: input.runId, points: input.outcome.cells.length };
    }
}
