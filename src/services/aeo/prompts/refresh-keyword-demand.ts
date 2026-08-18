import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { dataForSeoAuthHeader } from "@/services/aeo/engines/adapters/dataforseo-client";
import { parseKeywordDemandResponse, type KeywordDemandEnvelope } from "./keyword-demand";

type Admin = SupabaseClient<Database>;
const URL = "https://api.dataforseo.com/v3/dataforseo_labs/google/historical_keyword_data/live";

export async function refreshKeywordDemand(db: Admin, businessId: string) {
    const login = process.env.DATAFORSEO_LOGIN?.trim();
    const password = process.env.DATAFORSEO_PASSWORD?.trim();
    if (!login || !password) return { skipped: "provider_not_configured" as const };
    const [businessResult, promptsResult] = await Promise.all([
        db.from("businesses").select("city, state, country").eq("id", businessId).single(),
        db.from("aeo_prompts").select("id, prompt_text").eq("business_id", businessId).eq("is_active", true),
    ]);
    if (businessResult.error || promptsResult.error) throw new Error("Unable to load demand inputs");
    const business = businessResult.data;
    const location = [business.city, business.state, business.country === "US" ? "United States" : business.country]
        .filter(Boolean).join(",");
    if (!location || !promptsResult.data?.length) return { skipped: "no_prompts_or_location" as const };
    const response = await fetch(URL, {
        method: "POST", signal: AbortSignal.timeout(60_000),
        headers: { Authorization: dataForSeoAuthHeader(login, password), "Content-Type": "application/json" },
        body: JSON.stringify([{ keywords: promptsResult.data.map((row) => row.prompt_text),
            location_name: location, language_code: "en" }]),
    });
    if (!response.ok) throw new Error(`DataForSEO demand returned HTTP ${response.status}`);
    const capturedAt = new Date().toISOString();
    const payload = await response.json() as KeywordDemandEnvelope;
    const estimates = parseKeywordDemandResponse(payload, capturedAt);
    const estimatesByText = new Map(estimates.map((row) => [row.keyword, row]));
    const totalCost = Math.round((payload.tasks?.[0]?.cost ?? payload.cost ?? 0) * 1_000_000);
    let persisted = 0;
    let available = 0;
    for (const prompt of promptsResult.data) {
        const estimate = estimatesByText.get(prompt.prompt_text.trim());
        if (estimate) available += 1;
        const result = await db.from("aeo_prompt_demand_estimates" as never).upsert({
            business_id: businessId, prompt_id: prompt.id, location_name: location, language_code: "en",
            monthly_search_volume: estimate?.monthlyVolume ?? null, provider: estimate?.provider ?? "dataforseo",
            provider_cost_micro_usd: Math.round(totalCost / promptsResult.data.length),
            source_month: estimate?.sourceMonth ?? null, measured_at: capturedAt,
        } as never, { onConflict: "business_id,prompt_id,location_name,language_code" });
        if (result.error) throw new Error(`Demand upsert failed: ${result.error.message}`);
        persisted += 1;
    }
    return { persisted, available, location };
}
