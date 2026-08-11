import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { SupabaseAlertStore } from "./alert-store";
import { detectVisibilityAlerts, groupByPromptEngine, type VisibilitySampleFact } from "./detect-visibility-alerts";
import { detectNewTechnicalAlerts, findingKey, type FindingLike } from "./detect-technical-alerts";
import type { AnswerEngineId } from "../engines/engine-types";

type Admin = SupabaseClient<Database>;

/** History window wide enough to likely contain 6 weekly samples per (prompt, engine) without scanning the whole table. */
const SAMPLE_LOOKBACK_DAYS = 120;

/**
 * F8: one business's alert check. Read-heavy, side-effect-only through
 * SupabaseAlertStore's cooldown-gated insert — safe to re-run.
 */
export async function runAlertDetectionForBusiness(
    db: Admin,
    input: { businessId: string; organizationId: string }
): Promise<{ created: number }> {
    const store = new SupabaseAlertStore(db);
    let created = 0;

    // --- F8.1: visibility drop/gain ---
    const lookback = new Date(Date.now() - SAMPLE_LOOKBACK_DAYS * 86_400_000).toISOString();
    const { data: sampleRows } = await db
        .from("aeo_samples")
        .select("id, prompt_id, engine_id, status, sampled_at")
        .eq("business_id", input.businessId)
        .gte("sampled_at", lookback)
        .order("sampled_at", { ascending: false });

    const rows = (sampleRows ?? []).filter((r) => r.prompt_id !== null);
    if (rows.length > 0) {
        const okSampleIds = rows.filter((r) => r.status === "ok").map((r) => r.id);
        const { data: mentionRows } = okSampleIds.length
            ? await db
                  .from("aeo_brand_mentions")
                  .select("sample_id")
                  .eq("business_id", input.businessId)
                  .eq("brand_kind", "own")
                  .eq("cited_only", false)
                  .in("sample_id", okSampleIds)
            : { data: [] };
        const namedSampleIds = new Set((mentionRows ?? []).map((m) => m.sample_id));

        const promptIds = [...new Set(rows.map((r) => r.prompt_id as string))];
        const { data: promptRows } = await db.from("aeo_prompts").select("id, prompt_text").in("id", promptIds);
        const promptText = new Map((promptRows ?? []).map((p) => [p.id, p.prompt_text]));

        const facts: VisibilitySampleFact[] = rows.map((r) => ({
            promptId: r.prompt_id as string,
            promptText: promptText.get(r.prompt_id as string) ?? "(prompt removed)",
            engineId: r.engine_id as AnswerEngineId,
            status: r.status as VisibilitySampleFact["status"],
            ownBrandNamed: namedSampleIds.has(r.id),
            sampledAt: r.sampled_at,
        }));

        const visibilityAlerts = detectVisibilityAlerts(groupByPromptEngine(facts));
        for (const alert of visibilityAlerts) {
            const result = await store.createIfNotCoolingDown({
                businessId: input.businessId,
                organizationId: input.organizationId,
                alertType: alert.direction === "drop" ? "visibility_drop" : "visibility_gain",
                severity: alert.direction === "drop" ? "high" : "low",
                promptId: alert.promptId,
                engineId: alert.engineId,
                title: `${alert.direction === "drop" ? "Visibility dropped" : "Visibility improved"} on ${alert.engineId}`,
                detail: `"${alert.promptText}" went from ${Math.round(alert.baselineRate * 100)}% to ${Math.round(alert.recentRate * 100)}% named on ${alert.engineId}.`,
                evidence: {
                    baselineRate: alert.baselineRate,
                    recentRate: alert.recentRate,
                    deltaPercentagePoints: alert.deltaPercentagePoints,
                    pValue: alert.pValue,
                    recentTrials: alert.recentTrials,
                    baselineTrials: alert.baselineTrials,
                },
            });
            if (result) created += 1;
        }
    }

    // --- F8.4: newly-appeared technical blockers ---
    const { data: runRows } = await db
        .from("crawl_runs")
        .select("id, status")
        .eq("business_id", input.businessId)
        .order("started_at", { ascending: false })
        .limit(2);

    const [latestRun, previousRun] = runRows ?? [];
    if (latestRun && (latestRun.status === "success" || latestRun.status === "partial")) {
        const { data: currentFindingRows } = await db
            .from("crawl_findings")
            .select("rule, severity, page_url")
            .eq("crawl_run_id", latestRun.id);

        const { data: previousFindingRows } = previousRun
            ? await db.from("crawl_findings").select("rule, page_url").eq("crawl_run_id", previousRun.id)
            : { data: [] };

        const previousKeys = new Set(
            (previousFindingRows ?? []).map((f) => findingKey({ rule: f.rule as FindingLike["rule"], pageUrl: f.page_url }))
        );
        const currentFindings: FindingLike[] = (currentFindingRows ?? []).map((f) => ({
            rule: f.rule as FindingLike["rule"],
            severity: f.severity as FindingLike["severity"],
            pageUrl: f.page_url,
            evidence: "",
        }));

        const newTechnical = detectNewTechnicalAlerts(currentFindings, previousKeys);
        for (const finding of newTechnical) {
            const result = await store.createIfNotCoolingDown({
                businessId: input.businessId,
                organizationId: input.organizationId,
                alertType: "technical_blocker",
                severity: finding.severity,
                promptId: null,
                engineId: null,
                title: `New ${finding.severity} finding: ${finding.rule.replace(/_/g, " ")}`,
                detail: finding.pageUrl ? `On ${finding.pageUrl}` : "Site-wide finding",
                evidence: { rule: finding.rule, pageUrl: finding.pageUrl },
            });
            if (result) created += 1;
        }
    }

    // --- F8's run-failure edge case: a failed run gets a run-health notice, never a visibility alert ---
    if (latestRun?.status === "failed") {
        const result = await store.createIfNotCoolingDown({
            businessId: input.businessId,
            organizationId: input.organizationId,
            alertType: "run_failure",
            severity: "medium",
            promptId: null,
            engineId: null,
            title: "Technical audit run failed",
            detail: "The most recent site crawl did not complete. This is a run-health notice, not a visibility change.",
            evidence: { crawlRunId: latestRun.id },
        });
        if (result) created += 1;
    }

    const { data: latestAeoRun } = await db
        .from("aeo_runs")
        .select("id, status")
        .eq("business_id", input.businessId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (latestAeoRun?.status === "failed") {
        const result = await store.createIfNotCoolingDown({
            businessId: input.businessId,
            organizationId: input.organizationId,
            alertType: "run_failure",
            severity: "medium",
            promptId: null,
            engineId: null,
            title: "AI sampling run failed",
            detail: "The most recent visibility sampling run did not complete. This is a run-health notice, not a visibility change.",
            evidence: { aeoRunId: latestAeoRun.id },
        });
        if (result) created += 1;
    }

    return { created };
}
