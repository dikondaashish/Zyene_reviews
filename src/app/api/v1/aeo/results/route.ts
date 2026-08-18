import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { authorizeAeoScope, corsPreflight, withCors } from "@/app/api/v1/_lib/auth";
import { parsePage } from "@/app/api/v1/aeo/_lib/query";

export async function OPTIONS() { return corsPreflight(); }

export async function GET(req: NextRequest) {
    const auth = await authorizeAeoScope(req, "results:read");
    if (!auth.ok) return auth.response;
    const page = parsePage(req.nextUrl.searchParams);
    if (!page) return withCors(NextResponse.json({ success: false, error: "Invalid pagination" }, { status: 400 }));
    let query = createAdminClient().from("aeo_samples")
        .select("id, run_id, prompt_id, engine_id, model_id, status, citations_availability, no_answer_reason, error_kind, attempt, latency_ms, cost_micro_usd, is_estimated, sampled_at", { count: "exact" })
        .eq("business_id", auth.businessId);
    const engine = req.nextUrl.searchParams.get("engine");
    if (engine) query = query.eq("engine_id", engine);
    const result = await query.order("sampled_at", { ascending: false }).range(page.from, page.to);
    if (result.error) return withCors(NextResponse.json({ success: false, error: "Failed to fetch AEO results" }, { status: 500 }));
    return withCors(NextResponse.json({ success: true, data: { page: page.page, limit: page.limit, total: result.count ?? 0, results: result.data ?? [] } }));
}
