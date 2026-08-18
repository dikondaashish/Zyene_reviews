import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { detectMetricAnomaly } from "./anomaly-detection";
import { SupabaseAlertStore } from "./alert-store";

type Admin = SupabaseClient<Database>;

export async function evaluateVisibilityAnomaly(db: Admin, input: { businessId: string; organizationId: string }) {
    const cutoff = new Date(Date.now() - 180 * 86_400_000).toISOString();
    const samples = await db.from("aeo_samples").select("id, sampled_at")
        .eq("business_id", input.businessId).eq("status", "ok").eq("is_estimated", false)
        .gte("sampled_at", cutoff).order("sampled_at", { ascending: true });
    if (samples.error) throw new Error(`Anomaly samples failed: ${samples.error.message}`);
    const sampleIds = (samples.data ?? []).map((row) => row.id);
    const mentions = sampleIds.length ? await db.from("aeo_brand_mentions").select("sample_id")
        .eq("business_id", input.businessId).eq("brand_kind", "own").eq("cited_only", false).in("sample_id", sampleIds)
        : { data: [], error: null };
    if (mentions.error) throw new Error(`Anomaly mentions failed: ${mentions.error.message}`);
    const named = new Set((mentions.data ?? []).map((row) => row.sample_id));
    const days = new Map<string, { total: number; named: number }>();
    for (const row of samples.data ?? []) {
        const day = row.sampled_at.slice(0, 10);
        const aggregate = days.get(day) ?? { total: 0, named: 0 };
        aggregate.total += 1;
        if (named.has(row.id)) aggregate.named += 1;
        days.set(day, aggregate);
    }
    const points = [...days].map(([date, row]) => ({ date, value: row.named / row.total }));
    const current = points.at(-1) ?? { date: new Date().toISOString().slice(0, 10), value: 0 };
    const result = detectMetricAnomaly(points.slice(0, -1), current);
    const eligible = result.eligible;
    const write = await db.from("aeo_anomaly_evaluations" as never).upsert({
        business_id: input.businessId, metric: "visibility_rate", evaluated_date: current.date,
        history_days: result.historyDays, current_value: current.value,
        baseline_median: eligible ? result.baseline : null,
        median_absolute_deviation: eligible ? result.mad : null,
        robust_z_score: eligible && Number.isFinite(result.robustZ) ? result.robustZ : null,
        eligible, anomalous: eligible ? result.anomalous : false,
        direction: eligible ? (result.direction === "up" ? "high" : "low") : null,
    } as never, { onConflict: "business_id,metric,evaluated_date" });
    if (write.error) throw new Error(`Anomaly evaluation failed: ${write.error.message}`);
    let alertId: string | null = null;
    if (eligible && result.anomalous) {
        const alert = await new SupabaseAlertStore(db).createIfNotCoolingDown({
            businessId: input.businessId, organizationId: input.organizationId,
            alertType: "statistical_anomaly", severity: result.direction === "down" ? "high" : "low",
            promptId: null, engineId: null, title: `Unusual AI visibility ${result.direction === "down" ? "drop" : "increase"}`,
            detail: `Visibility deviated from its 90-day statistical baseline on ${current.date}.`,
            evidence: { current: current.value, baseline: result.baseline, mad: result.mad,
                robustZ: Number.isFinite(result.robustZ) ? result.robustZ : null, historyDays: result.historyDays },
        });
        alertId = alert?.id ?? null;
    }
    return { eligible, anomalous: eligible ? result.anomalous : false, historyDays: result.historyDays, alertId };
}
