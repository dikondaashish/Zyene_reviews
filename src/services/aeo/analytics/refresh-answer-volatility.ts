import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { computeAnswerVolatility } from "./answer-volatility";

type Admin = SupabaseClient<Database>;
type Envelope = { answerText?: string; citations?: { availability?: string; items?: { url?: string }[] } };

export async function refreshAnswerVolatility(db: Admin, businessId: string) {
    const cutoff = new Date(Date.now() - 90 * 86_400_000).toISOString();
    const { data, error } = await db.from("aeo_samples")
        .select("prompt_id, engine_id, sampled_at, answer_storage_path")
        .eq("business_id", businessId).eq("status", "ok").eq("is_estimated", false)
        .gte("sampled_at", cutoff).not("prompt_id", "is", null).not("answer_storage_path", "is", null)
        .order("sampled_at", { ascending: true });
    if (error) throw new Error(`Volatility samples failed: ${error.message}`);
    const groups = new Map<string, typeof data>();
    for (const row of data ?? []) {
        const key = `${row.prompt_id}:${row.engine_id}`;
        groups.set(key, [...(groups.get(key) ?? []), row]);
    }
    let refreshed = 0;
    for (const rows of groups.values()) {
        if (rows.length < 2) continue;
        const observations: { answerText: string; citations: string[] }[] = [];
        for (const row of rows) {
            const downloaded = await db.storage.from("aeo-answers").download(row.answer_storage_path as string);
            if (downloaded.error) continue;
            const envelope = JSON.parse(await downloaded.data.text()) as Envelope;
            if (!envelope.answerText) continue;
            observations.push({
                answerText: envelope.answerText,
                citations: envelope.citations?.availability === "present"
                    ? (envelope.citations.items ?? []).flatMap((item) => item.url ? [item.url] : []) : [],
            });
        }
        if (observations.length < 2) continue;
        const metric = computeAnswerVolatility(observations);
        const first = rows[0];
        const last = rows.at(-1);
        const upsert = await db.from("aeo_answer_volatility" as never).upsert({
            business_id: businessId, prompt_id: first?.prompt_id, engine_id: first?.engine_id,
            window_start: first?.sampled_at, window_end: last?.sampled_at,
            observation_count: metric.observations, answer_volatility: metric.answerVolatility,
            citation_volatility: metric.citationVolatility, calculated_at: new Date().toISOString(),
        } as never, { onConflict: "business_id,prompt_id,engine_id" });
        if (upsert.error) throw new Error(`Volatility upsert failed: ${upsert.error.message}`);
        refreshed += 1;
    }
    return { refreshed };
}
