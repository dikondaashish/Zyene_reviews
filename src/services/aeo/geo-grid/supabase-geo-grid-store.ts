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

    async persist(input: {
        businessId: string;
        keyword: string;
        gridSize: 5 | 7 | 9;
        spacingMeters: number;
        centerLat: number;
        centerLng: number;
        outcome: GeoGridOutcome;
    }): Promise<{ runId: string; points: number }> {
        const { data: run, error: runError } = await this.db
            .from("aeo_geo_grid_runs")
            .insert({
                business_id: input.businessId,
                keyword: input.keyword,
                grid_size: input.gridSize,
                spacing_meters: input.spacingMeters,
                center_lat: input.centerLat,
                center_lng: input.centerLng,
                status: input.outcome.status,
                is_estimated: false,
                error_message:
                    input.outcome.failedCells > 0
                        ? `${input.outcome.failedCells} of ${input.outcome.cells.length} cells failed to search`
                        : null,
                completed_at: new Date().toISOString(),
            })
            .select("id")
            .single();

        if (runError) throw new Error(`geo grid run insert failed: ${runError.message}`);

        const { error: pointsError } = await this.db.from("aeo_geo_grid_points").insert(
            input.outcome.cells.map((cell) => ({
                run_id: run.id,
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
                place_id_found: null,
                top_competitors: cell.topCompetitors,
            }))
        );

        if (pointsError) throw new Error(`geo grid points insert failed: ${pointsError.message}`);

        return { runId: run.id, points: input.outcome.cells.length };
    }
}
