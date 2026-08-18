import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { classifyFindingImpact, type FindingImpact } from "@/services/aeo/crawler/finding-prompt-linkage";
import { isLiveCrawlingEnabled } from "@/lib/features/aeo-surfaces";
import type { CrawlFindingRule, CrawlFindingSeverity } from "@/services/aeo/crawler/crawl-findings";
import { assertAeoQueriesSucceeded } from "@/services/aeo/query-results";

export type AuditFinding = {
    id: string;
    rule: CrawlFindingRule;
    severity: CrawlFindingSeverity;
    pageUrl: string | null;
    evidence: string;
    fixInstruction: string;
    impact: FindingImpact;
};

export type AuditRun = {
    id: string;
    status: string;
    origin: string;
    startedAt: string;
    completedAt: string | null;
    pagesDiscovered: number;
    pagesCrawled: number;
    pageCap: number;
    errorMessage: string | null;
};

export type AuditPageData =
    | { kind: "no-business" }
    | { kind: "no-website"; businessId: string; businessName: string }
    | {
          kind: "ok";
          businessId: string;
          businessName: string;
          liveCrawlingEnabled: boolean;
          latestRun: AuditRun | null;
          findings: AuditFinding[];
      };

export async function loadAuditPageData(): Promise<AuditPageData> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { businessId, business } = await getActiveBusinessId();
    if (!businessId || !business) return { kind: "no-business" };

    const businessName = typeof business.name === "string" ? business.name : "this business";
    const website = (business as { website?: string | null }).website ?? null;
    if (!website?.trim()) return { kind: "no-website", businessId, businessName };

    const runResult = await supabase
        .from("crawl_runs")
        .select("id, status, origin, started_at, completed_at, pages_discovered, pages_crawled, page_cap, error_message")
        .eq("business_id", businessId)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
    assertAeoQueriesSucceeded("Unable to load AEO crawl run", runResult);
    const runRow = runResult.data;

    const latestRun: AuditRun | null = runRow
        ? {
              id: runRow.id,
              status: runRow.status,
              origin: runRow.origin,
              startedAt: runRow.started_at,
              completedAt: runRow.completed_at,
              pagesDiscovered: runRow.pages_discovered,
              pagesCrawled: runRow.pages_crawled,
              pageCap: runRow.page_cap,
              errorMessage: runRow.error_message,
          }
        : null;

    let findings: AuditFinding[] = [];
    if (latestRun && (latestRun.status === "success" || latestRun.status === "partial")) {
        const findingResult = await supabase
            .from("crawl_findings")
            .select("id, rule, severity, page_url, evidence, fix_instruction")
            .eq("crawl_run_id", latestRun.id)
            .order("severity", { ascending: true });
        assertAeoQueriesSucceeded("Unable to load AEO crawl findings", findingResult);
        const findingRows = findingResult.data;

        const promptResult = await supabase
            .from("aeo_prompts")
            .select("id, prompt_text")
            .eq("business_id", businessId)
            .eq("is_active", true);
        assertAeoQueriesSucceeded("Unable to load active AEO prompts", promptResult);
        const activePrompts = promptResult.data;

        const activePromptIds = (activePrompts ?? []).map((p) => p.id);
        const promptTextById = new Map((activePrompts ?? []).map((p) => [p.id, p.prompt_text]));

        const sampleResult = activePromptIds.length
            ? await supabase
                  .from("aeo_samples")
                  .select("id, prompt_id")
                  .eq("business_id", businessId)
                  .eq("status", "ok")
                  .in("prompt_id", activePromptIds)
            : { data: [], error: null };
        assertAeoQueriesSucceeded("Unable to load cited AEO samples", sampleResult);
        const citedSamples = sampleResult.data;

        const sampleIds = (citedSamples ?? []).map((s) => s.id);
        const promptIdBySampleId = new Map((citedSamples ?? []).map((s) => [s.id, s.prompt_id]));

        const citationResult = sampleIds.length
            ? await supabase
                  .from("aeo_citations")
                  .select("sample_id, normalized_url")
                  .eq("business_id", businessId)
                  .in("sample_id", sampleIds)
            : { data: [], error: null };
        assertAeoQueriesSucceeded("Unable to load AEO citations", citationResult);
        const citationRows = citationResult.data;

        const citations = (citationRows ?? [])
            .map((c) => {
                const promptId = promptIdBySampleId.get(c.sample_id);
                if (!promptId) return null;
                return { normalizedUrl: c.normalized_url, promptId, promptText: promptTextById.get(promptId) ?? "" };
            })
            .filter((c): c is { normalizedUrl: string; promptId: string; promptText: string } => c !== null);

        findings = (findingRows ?? []).map((f) => ({
            id: f.id,
            rule: f.rule as CrawlFindingRule,
            severity: f.severity as CrawlFindingSeverity,
            pageUrl: f.page_url,
            evidence: f.evidence,
            fixInstruction: f.fix_instruction,
            impact: classifyFindingImpact(
                { pageUrl: f.page_url },
                { citations, activePromptCount: activePromptIds.length }
            ),
        }));
    }

    return {
        kind: "ok",
        businessId,
        businessName,
        liveCrawlingEnabled: isLiveCrawlingEnabled(),
        latestRun,
        findings,
    };
}
