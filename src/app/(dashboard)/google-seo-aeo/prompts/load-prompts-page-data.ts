import { redirect } from "next/navigation";

import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { engineRegistry } from "@/services/aeo/engines/engine-registry";
import { registerAeoAdapters } from "@/services/aeo/engines/register-adapters";
import { isLiveSamplingEnabled } from "@/lib/features/aeo-surfaces";
import type { AnswerEngineId } from "@/services/aeo/engines/engine-types";
import { loadQuotaMeter } from "./load-quota-meter";
import { computeQuotaMeter, type QuotaMeterResult } from "@/services/aeo/billing/quota-meter";
import { assertAeoQueriesSucceeded } from "@/services/aeo/query-results";

export type PromptRow = {
    id: string;
    promptText: string;
    intent: string | null;
    localeCity: string | null;
    source: string;
    isActive: boolean;
    createdAt: string;
    /** Observations recorded for this prompt so far. */
    sampleCount: number;
    /** F4.3 cluster name, or null for prompts filed under none. */
    clusterName: string | null;
};

export type EngineCoverage = {
    id: AnswerEngineId;
    label: string;
    state: string;
    reason: string;
};

export type PromptsPageData =
    | { kind: "no-business" }
    | {
          kind: "ok";
          businessId: string;
          businessName: string;
          prompts: PromptRow[];
          activeCount: number;
          engines: EngineCoverage[];
          /** Engines that would actually run today. Drives the cost estimate. */
          runnableEngineCount: number;
          liveSamplingEnabled: boolean;
          quotaMeter: QuotaMeterResult;
      };

export async function loadPromptsPageData(): Promise<PromptsPageData> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { businessId, business, organization } = await getActiveBusinessId();
    if (!businessId || !business) return { kind: "no-business" };

    // RLS-scoped read: the policy restricts aeo_prompts to the caller's orgs.
    // The cluster name is joined through the FK rather than fetched separately
    // so grouping needs no second round-trip (F4.3).
    const promptResult = await supabase
        .from("aeo_prompts")
        .select(
            "id, prompt_text, intent, locale_city, source, is_active, created_at, aeo_prompt_clusters(name)"
        )
        .eq("business_id", businessId)
        .order("is_active", { ascending: false })
        .order("created_at", { ascending: false });
    assertAeoQueriesSucceeded("Unable to load AEO prompts", promptResult);
    const promptRows = promptResult.data;

    const prompts = promptRows ?? [];

    // One grouped count rather than a query per prompt.
    const sampleResult = await supabase
        .from("aeo_samples")
        .select("prompt_id")
        .eq("business_id", businessId);
    assertAeoQueriesSucceeded("Unable to load AEO prompt observations", sampleResult);
    const sampleRows = sampleResult.data;

    const samplesByPrompt = new Map<string, number>();
    for (const row of sampleRows ?? []) {
        if (!row.prompt_id) continue;
        samplesByPrompt.set(row.prompt_id, (samplesByPrompt.get(row.prompt_id) ?? 0) + 1);
    }

    registerAeoAdapters();
    const engines = engineRegistry.describeAll().map((availability) => ({
        id: availability.descriptor.id,
        label: availability.descriptor.label,
        state: availability.state,
        reason: availability.reason,
    }));
    const runnableEngineCount = engines.filter((engine) => engine.state === "available").length;
    const activeCount = prompts.filter((row) => row.is_active).length;

    const quotaMeter = organization
        ? await loadQuotaMeter(supabase, organization.id, organization.plan ?? null, activeCount, runnableEngineCount)
        : computeQuotaMeter({
              activePrompts: activeCount,
              runnableEngines: runnableEngineCount,
              planId: null,
              balanceMicroUsd: null,
          });

    return {
        kind: "ok",
        businessId,
        businessName: business.name ?? "this business",
        prompts: prompts.map((row) => ({
            id: row.id,
            promptText: row.prompt_text,
            intent: row.intent,
            localeCity: row.locale_city,
            source: row.source,
            isActive: row.is_active,
            createdAt: row.created_at,
            sampleCount: samplesByPrompt.get(row.id) ?? 0,
            clusterName: row.aeo_prompt_clusters?.name ?? null,
        })),
        activeCount,
        engines,
        runnableEngineCount,
        quotaMeter,
        // Surfaced rather than hidden: an active prompt with sampling disabled
        // will never run, and a user staring at "3 active" deserves to know why
        // nothing is happening.
        liveSamplingEnabled: isLiveSamplingEnabled(),
    };
}
