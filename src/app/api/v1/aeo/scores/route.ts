import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { authorizeAeoScope, corsPreflight, withCors } from "@/app/api/v1/_lib/auth";
import { computeEngineVisibility, computeOverallVisibility, type SampleFact } from "@/services/aeo/reporting/visibility-metrics";
import type { AnswerEngineId } from "@/services/aeo/engines/engine-types";

export async function OPTIONS() { return corsPreflight(); }

export async function GET(req: NextRequest) {
    const auth = await authorizeAeoScope(req, "scores:read");
    if (!auth.ok) return auth.response;
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const admin = createAdminClient();
    const [samples, mentions] = await Promise.all([
        admin.from("aeo_samples").select("id, engine_id, status, model_id, is_estimated, answer_storage_path, sampled_at")
            .eq("business_id", auth.businessId).gte("sampled_at", since.toISOString()),
        admin.from("aeo_brand_mentions").select("sample_id").eq("business_id", auth.businessId).eq("brand_kind", "own").eq("cited_only", false),
    ]);
    if (samples.error || mentions.error) return withCors(NextResponse.json({ success: false, error: "Failed to calculate AEO scores" }, { status: 500 }));
    const named = new Set((mentions.data ?? []).map((row) => row.sample_id));
    const facts: SampleFact[] = (samples.data ?? []).map((row) => ({
        engineId: row.engine_id as AnswerEngineId, status: row.status as SampleFact["status"], modelId: row.model_id,
        ownBrandNamed: named.has(row.id), isEstimated: row.is_estimated,
        hasStoredAnswer: Boolean(row.answer_storage_path), sampledAt: row.sampled_at,
    }));
    return withCors(NextResponse.json({ success: true, data: { windowDays: 30, overall: computeOverallVisibility(facts), engines: computeEngineVisibility(facts) } }));
}
