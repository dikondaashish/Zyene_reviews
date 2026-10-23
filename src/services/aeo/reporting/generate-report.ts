import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { renderAeoReportHtml } from "./report-html";
import { renderAeoReportPdf } from "./report-pdf";
import type { AeoReportModel } from "./report-model";
import { checkOriginIsPublic } from "@/services/aeo/crawler/ssrf-guard";
import { fetchPublicHttpBytes } from "@/services/aeo/crawler/public-http";
import { assertAeoQueriesSucceeded } from "@/services/aeo/query-results";

type Admin = SupabaseClient<Database>;
type DateRange = { start: string; end: string };

type ReportBranding = {
    name: string; logo_url: string | null; primary_color: string; hide_powered_by: boolean;
    aeo_sender_domain: string | null; aeo_sender_domain_status: string;
};
type PromptAggregate = { prompt: string; named: number; samples: number };

async function loadReportBranding(db: Admin, organizationId: string): Promise<ReportBranding> {
    const organization = await db.from("organizations" as never)
        .select("name, logo_url, primary_color, hide_powered_by, aeo_sender_domain, aeo_sender_domain_status" as never)
        .eq("id" as never, organizationId).single() as unknown as {
            data: ReportBranding | null; error: { message: string } | null;
        };
    if (organization.error || !organization.data) throw new Error("Unable to load report branding");
    return organization.data;
}

async function fetchLogoDataUrl(logoUrl: string | null): Promise<string | null> {
    if (!logoUrl) return null;
    const safety = await checkOriginIsPublic(logoUrl);
    if (!safety.safe) return null;
    try {
        const response = await fetchPublicHttpBytes(logoUrl, { redirect: "error", timeoutMs: 8_000, maxBytes: 2_000_001 });
        if (!response.ok) throw new Error(`Logo returned HTTP ${response.status}`);
        const mime = response.contentType?.split(";")[0] ?? "";
        const bytes = Buffer.from(response.bytes);
        if (!/^image\/(png|jpe?g)$/.test(mime) || bytes.length > 2_000_000) return null;
        return `data:${mime};base64,${bytes.toString("base64")}`;
    } catch {
        // Report still carries the agency name and color.
        return null;
    }
}

export function summarizePromptSamples(
    samples: { id: string; prompt_id: string | null }[],
    ownNamed: Set<string>,
    promptNames: Map<string, string>,
): PromptAggregate[] {
    const aggregates = new Map<string, PromptAggregate>();
    for (const sample of samples) {
        if (!sample.prompt_id) continue;
        const row = aggregates.get(sample.prompt_id) ?? { prompt: promptNames.get(sample.prompt_id) ?? "Deleted prompt", named: 0, samples: 0 };
        row.samples += 1;
        if (ownNamed.has(sample.id)) row.named += 1;
        aggregates.set(sample.prompt_id, row);
    }
    return [...aggregates.values()].sort((a, b) => b.samples - a.samples || b.named - a.named).slice(0, 20);
}

async function loadPromptNames(db: Admin, promptIds: string[]) {
    if (!promptIds.length) return new Map<string, string>();
    const prompts = await db.from("aeo_prompts").select("id, prompt_text").in("id", promptIds);
    if (prompts.error) throw new Error(`Unable to load report prompts: ${prompts.error.message}`);
    return new Map((prompts.data ?? []).map((row) => [row.id, row.prompt_text]));
}

async function loadReportInputs(db: Admin, businessId: string, range: DateRange) {
    const from = `${range.start}T00:00:00.000Z`;
    const to = `${range.end}T23:59:59.999Z`;
    const [business, sampleResult, citations, findings] = await Promise.all([
        db.from("businesses").select("name, organization_id").eq("id", businessId).single(),
        db.from("aeo_samples").select("id, prompt_id, status, is_estimated").eq("business_id", businessId)
            .gte("sampled_at", from).lte("sampled_at", to),
        db.from("aeo_citations").select("classification").eq("business_id", businessId)
            .gte("created_at", from).lte("created_at", to),
        db.from("crawl_findings").select("id, crawl_runs!inner(business_id, started_at)")
            .eq("crawl_runs.business_id", businessId).gte("crawl_runs.started_at", from)
            .lte("crawl_runs.started_at", to),
    ]);
    assertAeoQueriesSucceeded("Unable to load AEO report inputs", business, sampleResult, citations, findings);
    if (!business.data) throw new Error("Unable to load AEO report business");
    return {
        business: business.data,
        samples: sampleResult.data ?? [],
        citations: citations.data ?? [],
        findingCount: findings.data?.length ?? 0,
    };
}

export async function buildAeoReportModel(db: Admin, businessId: string, range: DateRange): Promise<AeoReportModel> {
    const { business, samples, citations, findingCount } = await loadReportInputs(db, businessId, range);
    const branding = await loadReportBranding(db, business.organization_id);
    const brandLogoDataUrl = await fetchLogoDataUrl(branding.logo_url);
    const real = samples.filter((row) => !row.is_estimated);
    const successful = real.filter((row) => row.status === "ok");
    const ids = successful.map((row) => row.id);
    const mentions = ids.length ? await db.from("aeo_brand_mentions").select("sample_id, brand_kind, cited_only")
        .eq("business_id", businessId).in("sample_id", ids) : { data: [], error: null };
    if (mentions.error) throw new Error("Unable to load report mentions");
    const ownNamed = new Set((mentions.data ?? []).filter((row) => row.brand_kind === "own" && !row.cited_only).map((row) => row.sample_id));
    const promptIds = [...new Set(successful.map((row) => row.prompt_id).filter((id): id is string => Boolean(id)))];
    const promptNames = await loadPromptNames(db, promptIds);
    return {
        brandName: branding.name,
        brandColor: branding.primary_color,
        brandLogoUrl: branding.logo_url,
        brandLogoDataUrl,
        hidePoweredBy: branding.hide_powered_by,
        senderDomain: branding.aeo_sender_domain,
        senderDomainVerified: branding.aeo_sender_domain_status === "verified",
        businessName: business.name ?? "Business",
        periodStart: range.start,
        periodEnd: range.end,
        visibilityPercent: successful.length ? (ownNamed.size / successful.length) * 100 : null,
        successfulSamples: successful.length,
        totalSamples: real.length,
        citations: citations.length,
        ownCitations: citations.filter((row) => row.classification === "own").length,
        competitorMentions: mentions.data?.filter((row) => row.brand_kind === "competitor").length ?? 0,
        technicalFindings: findingCount,
        topPrompts: summarizePromptSamples(successful, ownNamed, promptNames),
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
    if (insert.error || !insert.data) {
        await db.storage.from("aeo-reports").remove([path]);
        throw new Error(`Report insert failed: ${insert.error?.message ?? "missing row"}`);
    }
    return { reportId: insert.data.id, path, html, pdf, model };
}
