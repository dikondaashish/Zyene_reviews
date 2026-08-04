import { createClient } from "@/lib/db/supabase/server";

export async function fetchGoogleSeoAeoSecondaryData(
    businessId: string,
    latestAiRun: { id: string; query: string; status: string; created_at: string } | null,
    latestHeatmapRun: { id: string; keyword: string; status: string; created_at: string } | null
) {
    const supabase = await createClient();

    const [aiResultsRes, heatmapCellsRes, competitorsRes] = await Promise.all([
        latestAiRun
            ? supabase
                  .from("google_seo_ai_visibility_results")
                  .select("model, found, position, snippet")
                  .eq("run_id", latestAiRun.id)
                  .order("model", { ascending: true })
                  .limit(20)
            : Promise.resolve({ data: null }),
        latestHeatmapRun
            ? supabase
                  .from("google_seo_heatmap_cells")
                  .select("cell_label, rank_position, visibility_score")
                  .eq("run_id", latestHeatmapRun.id)
                  .order("visibility_score", { ascending: false })
                  .limit(30)
            : Promise.resolve({ data: null }),
        supabase
            .from("competitors")
            .select("id, name, average_rating, total_reviews, google_url")
            .eq("business_id", businessId)
            .order("average_rating", { ascending: false })
            .limit(3),
    ]);

    return {
        aiResults: aiResultsRes.data || [],
        heatmapCells: heatmapCellsRes.data || [],
        competitors: competitorsRes.data || [],
    };
}
