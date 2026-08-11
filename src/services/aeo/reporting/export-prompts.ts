import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { NextResponse } from "next/server";
import Papa from "papaparse";
import { MIN_OBSERVATIONS } from "./visibility-metrics";

/** F7.2: every prompt, its config, and its 30-day visibility — one row per prompt. */
export async function handlePromptsExport(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { businessId, business } = await getActiveBusinessId();
    if (!businessId || !business) return new NextResponse("No active business", { status: 403 });

    const { data: prompts, error: promptsError } = await supabase
        .from("aeo_prompts")
        .select("id, prompt_text, intent, locale_city, source, is_active, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

    if (promptsError || !prompts) {
        logger.error({ err: promptsError }, "[aeo/prompts/export]");
        return new NextResponse("Failed to load prompts", { status: 500 });
    }

    const { data: samples } = await supabase
        .from("aeo_samples")
        .select("id, prompt_id, status")
        .eq("business_id", businessId)
        .in("prompt_id", prompts.map((p) => p.id));

    const sampleRows = samples ?? [];
    const okSampleIds = sampleRows.filter((s) => s.status === "ok").map((s) => s.id);

    const { data: mentions } = okSampleIds.length
        ? await supabase
              .from("aeo_brand_mentions")
              .select("sample_id")
              .eq("business_id", businessId)
              .eq("brand_kind", "own")
              .eq("cited_only", false)
              .in("sample_id", okSampleIds)
        : { data: [] };

    const namedSampleIds = new Set((mentions ?? []).map((m) => m.sample_id));

    const byPrompt = new Map<string, { total: number; observed: number; named: number }>();
    for (const s of sampleRows) {
        if (!s.prompt_id) continue;
        const stat = byPrompt.get(s.prompt_id) ?? { total: 0, observed: 0, named: 0 };
        stat.total += 1;
        if (s.status === "ok") {
            stat.observed += 1;
            if (namedSampleIds.has(s.id)) stat.named += 1;
        }
        byPrompt.set(s.prompt_id, stat);
    }

    const formatted = prompts.map((p) => {
        const stat = byPrompt.get(p.id) ?? { total: 0, observed: 0, named: 0 };
        const enough = stat.observed >= MIN_OBSERVATIONS;
        return {
            "Prompt": p.prompt_text,
            "Intent": p.intent ?? "",
            "Locale city": p.locale_city ?? "",
            "Source": p.source,
            "Active": p.is_active ? "Yes" : "No",
            "Created (UTC)": p.created_at,
            "Total samples": stat.total,
            "Answered observations": stat.observed,
            "Named the brand": stat.named,
            "Visibility rate": enough ? `${((stat.named / stat.observed) * 100).toFixed(0)}%` : "insufficient data",
        };
    });

    const csvData = Papa.unparse(formatted);
    const safeName = (business.name || "business").replace(/[^a-z0-9]/gi, "_").toLowerCase();

    return new NextResponse(csvData, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${safeName}_aeo_prompts.csv"`,
        },
    });
}
