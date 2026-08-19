import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { NextResponse } from "next/server";
import Papa from "papaparse";

/** F7.2: every citation an engine gave for one of this business's samples. */
export async function handleCitationsExport() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { businessId, business } = await getActiveBusinessId();
    if (!businessId || !business) return new NextResponse("No active business", { status: 403 });

    const { data: citations, error } = await supabase
        .from("aeo_citations")
        .select("sample_id, domain, url, classification, ordinal, is_stale, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(10000);

    if (error) {
        logger.error({ err: error }, "[aeo/citations/export]");
        return new NextResponse("Failed to load citations", { status: 500 });
    }

    const rows = citations ?? [];
    const { data: samples } = rows.length
        ? await supabase
              .from("aeo_samples")
              .select("id, engine_id, prompt_id, sampled_at")
              .in("id", rows.map((c) => c.sample_id))
        : { data: [] };

    const sampleById = new Map((samples ?? []).map((s) => [s.id, s]));
    const promptIds = [...new Set((samples ?? []).map((s) => s.prompt_id).filter((id): id is string => !!id))];
    const { data: prompts } = promptIds.length
        ? await supabase.from("aeo_prompts").select("id, prompt_text").in("id", promptIds)
        : { data: [] };
    const promptText = new Map((prompts ?? []).map((p) => [p.id, p.prompt_text]));

    const formatted = rows.map((c) => {
        const sample = sampleById.get(c.sample_id);
        return {
            "Domain": c.domain,
            "URL": c.url,
            "Classification": c.classification,
            "Ordinal": c.ordinal,
            "Stale (404)": c.is_stale ? "Yes" : "No",
            "Engine": sample?.engine_id ?? "",
            "Prompt": sample?.prompt_id ? (promptText.get(sample.prompt_id) ?? "(prompt removed)") : "",
            "Sampled (UTC)": sample?.sampled_at ?? "",
        };
    });

    const csvData = Papa.unparse(formatted);
    const safeName = (business.name || "business").replace(/[^a-z0-9]/gi, "_").toLowerCase();

    return new NextResponse(csvData, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${safeName}_aeo_citations.csv"`,
        },
    });
}
