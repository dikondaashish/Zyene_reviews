import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import {
    computePromptTrend,
    recentWeekStarts,
    type PromptSampleFact,
    type WeeklyTrendPoint,
} from "@/services/aeo/reporting/prompt-trend";
import type { AnswerEngineId } from "@/services/aeo/engines/engine-types";
import { loadLatestBrief, type LatestBrief } from "./load-latest-brief";

const TREND_WEEKS = 12;

export type EngineTrend = { engineId: AnswerEngineId; points: WeeklyTrendPoint[] };

export type HeadToHeadRow = {
    sampleId: string;
    engineId: AnswerEngineId;
    status: "ok" | "no_answer" | "failed";
    sampledAt: string;
    ownBrandNamed: boolean;
    competitorsNamed: string[];
    answerStoragePath: string | null;
};

export type PromptDetailData =
    | { kind: "not-found" }
    | {
          kind: "ok";
          promptId: string;
          promptText: string;
          businessId: string;
          trend: EngineTrend[];
          weeks: string[];
          headToHead: HeadToHeadRow[];
          latestBrief: LatestBrief | null;
      };

/**
 * F4.5 + F3.6 share a loader: both read the same per-prompt sample window,
 * one bucketed into a trend, one reduced to each engine's latest result.
 */
export async function loadPromptDetail(promptId: string): Promise<PromptDetailData> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { businessId } = await getActiveBusinessId();
    if (!businessId) return { kind: "not-found" };

    // RLS-scoped: aeo_prompts' own policy is what actually enforces this
    // prompt belongs to the caller's business, not the eq() below.
    const { data: prompt } = await supabase
        .from("aeo_prompts")
        .select("id, prompt_text, business_id")
        .eq("id", promptId)
        .eq("business_id", businessId)
        .maybeSingle();

    if (!prompt) return { kind: "not-found" };

    const weeks = recentWeekStarts(TREND_WEEKS, new Date());
    const windowStart = `${weeks[0]}T00:00:00.000Z`;

    const { data: samples } = await supabase
        .from("aeo_samples")
        .select("id, engine_id, status, sampled_at, answer_storage_path")
        .eq("prompt_id", promptId)
        .gte("sampled_at", windowStart)
        .order("sampled_at", { ascending: false });

    const sampleRows = samples ?? [];

    const { data: mentions } = sampleRows.length
        ? await supabase
              .from("aeo_brand_mentions")
              .select("sample_id, brand_kind, brand_label, cited_only")
              .in("sample_id", sampleRows.map((s) => s.id))
              .eq("cited_only", false)
        : { data: [] };

    const ownNamedBySample = new Set(
        (mentions ?? []).filter((m) => m.brand_kind === "own").map((m) => m.sample_id)
    );
    const competitorsBySample = new Map<string, string[]>();
    for (const m of mentions ?? []) {
        if (m.brand_kind !== "competitor") continue;
        const list = competitorsBySample.get(m.sample_id) ?? [];
        list.push(m.brand_label);
        competitorsBySample.set(m.sample_id, list);
    }

    const facts: PromptSampleFact[] = sampleRows.map((row) => ({
        engineId: row.engine_id as AnswerEngineId,
        status: row.status as PromptSampleFact["status"],
        ownBrandNamed: ownNamedBySample.has(row.id),
        sampledAt: row.sampled_at,
    }));

    const trendMap = computePromptTrend(facts, weeks);
    const trend: EngineTrend[] = [...trendMap.entries()]
        .map(([engineId, points]) => ({ engineId, points }))
        .sort((a, b) => a.engineId.localeCompare(b.engineId));

    // Latest sample per engine — sampleRows is already sorted newest-first.
    const latestByEngine = new Map<string, (typeof sampleRows)[number]>();
    for (const row of sampleRows) {
        if (!latestByEngine.has(row.engine_id)) latestByEngine.set(row.engine_id, row);
    }

    const headToHead: HeadToHeadRow[] = [...latestByEngine.values()]
        .map((row) => ({
            sampleId: row.id,
            engineId: row.engine_id as AnswerEngineId,
            status: row.status as HeadToHeadRow["status"],
            sampledAt: row.sampled_at,
            ownBrandNamed: ownNamedBySample.has(row.id),
            competitorsNamed: competitorsBySample.get(row.id) ?? [],
            answerStoragePath: row.answer_storage_path,
        }))
        .sort((a, b) => a.engineId.localeCompare(b.engineId));

    const latestBrief = await loadLatestBrief(supabase, prompt.business_id, promptId);

    return {
        kind: "ok",
        promptId: prompt.id,
        promptText: prompt.prompt_text,
        businessId: prompt.business_id,
        trend,
        weeks,
        headToHead,
        latestBrief,
    };
}
