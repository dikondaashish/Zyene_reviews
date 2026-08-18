import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { renderAeoReportHtml } from "./report-html";
import { renderAeoReportPdf } from "./report-pdf";
import type { AeoReportModel } from "./report-model";

type Admin = SupabaseClient<Database>;
type DateRange = { start: string; end: string };

export async function buildAeoReportModel(db: Admin, businessId: string, range: DateRange): Promise<AeoReportModel> {
    const [business, sampleResult, citations, findings] = await Promise.all([
        db.from("businesses").select("name").eq("id", businessId).single(),
        db.from("aeo_samples").select("id, prompt_id, status, is_estimated").eq("business_id", businessId)
            .gte("sampled_at", `${range.start}T00:00:00.000Z`).lte("sampled_at", `${range.end}T23:59:59.999Z`),
        db.from("aeo_citations").select("classification").eq("business_id", businessId)
            .gte("created_at", `${range.start}T00:00:00.000Z`).lte("created_at", `${range.end}T23:59:59.999Z`),
        db.from("crawl_findings").select("id, crawl_runs!inner(business_id, started_at)")
            .eq("crawl_runs.business_id", businessId).gte("crawl_runs.started_at", `${range.start}T00:00:00.000Z`)
            .lte("crawl_runs.started_at", `${range.end}T23:59:59.999Z`),
    ]);
    if (business.error || sampleResult.error) throw new Error("Unable to load AEO report inputs");
    const real = (sampleResult.data ?? []).filter((row) => !row.is_estimated);
    const successful = real.filter((row) => row.status === "ok");
    const ids = successful.map((row) => row.id);
    const mentions = ids.length ? await db.from("aeo_brand_mentions").select("sample_id, brand_kind, cited_only")
        .eq("business_id", businessId).in("sample_id", ids) : { data: [], error: null };
    if (mentions.error) throw new Error("Unable to load report mentions");
    const ownNamed = new Set((mentions.data ?? []).filter((row) => row.brand_kind === "own" && !row.cited_only).map((row) => row.sample_id));
    const promptIds = [...new Set(successful.map((row) => row.prompt_id).filter((id): id is string => Boolean(id)))];
    const prompts = promptIds.length ? await db.from("aeo_prompts").select("id, prompt_text").in("id", promptIds) : { data: [], error: null };
    const promptNames = new Map((prompts.data ?? []).map((row) => [row.id, row.prompt_text]));
    const aggregates = new Map<string, { prompt: string; named: number; samples: number }>();
    for (const sample of successful) {
        if (!sample.prompt_id) continue;
        const row = aggregates.get(sample.prompt_id) ?? { prompt: promptNames.get(sample.prompt_id) ?? "Deleted prompt", named: 0, samples: 0 };
        row.samples += 1;
        if (ownNamed.has(sample.id)) row.named += 1;
        aggregates.set(sample.prompt_id, row);
    }
    return {
        brandName: "Zyene Reviews",
        businessName: business.data.name ?? "Business",
        periodStart: range.start,
        periodEnd: range.end,
        visibilityPercent: successful.length ? (ownNamed.size / successful.length) * 100 : null,
        successfulSamples: successful.length,
        totalSamples: real.length,
        citations: citations.data?.length ?? 0,
        ownCitations: citations.data?.filter((row) => row.classification === "own").length ?? 0,
        competitorMentions: mentions.data?.filter((row) => row.brand_kind === "competitor").length ?? 0,
        technicalFindings: findings.data?.length ?? 0,
        topPrompts: [...aggregates.values()].sort((a, b) => b.samples - a.samples || b.named - a.named).slice(0, 20),
    };
}

export async function generateStoredAeoReport(db: Admin, input: {
    organizationId: string; businessId: string; scheduleId?: string | null; range: DateRange; recipients?: string[];
}) {
    const model = await buildAeoReportModel(db, input.businessId, input.range);
    const html = renderAeoReportHtml(model);
    const pdf = renderAeoReportPdf(model);
    const path = `${input.organizationId}/${input.businessId}/${input.range.start}_${input.range.end}_${crypto.randomUUID()}.pdf`;
    const upload = await db.storage.from("aeo-reports").upload(path, pdf, { contentType: "application/pdf", upsert: false });
    if (upload.error) throw new Error(`Report upload failed: ${upload.error.message}`);
    const insert = await db.from("aeo_reports" as never).insert({
        organization_id: input.organizationId, business_id: input.businessId, schedule_id: input.scheduleId ?? null,
        period_start: input.range.start, period_end: input.range.end, format: "pdf", storage_path: path, html,
        recipients: input.recipients ?? [], delivery_status: "generated",
    } as never).select("id" as never).single() as unknown as { data: { id: string } | null; error: { message: string } | null };
    if (insert.error || !insert.data) throw new Error(`Report insert failed: ${insert.error?.message ?? "missing row"}`);
    return { reportId: insert.data.id, path, html, pdf, model };
}
