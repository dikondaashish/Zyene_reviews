import { z } from "zod";
import { generateContentWithFallback } from "@/domains/ai/adapters/vertex-adapter";
import { classifyPrompt } from "@/services/aeo/analytics/prompt-intent";
import { PROMPT_CLUSTERS, type PromptSuggestion } from "./suggest-prompts";

export type DemandQuery = { query: string; score: number; source: "gsc" | "gbp" };
const responseSchema = z.object({ prompts: z.array(z.object({ prompt: z.string().trim().min(5).max(300), sourceQuery: z.string().trim().min(1) })).max(30) });

export async function discoverPromptsFromDemand(input: {
    businessName: string; category: string; city: string | null; queries: readonly DemandQuery[];
}): Promise<PromptSuggestion[]> {
    const demand = input.queries.filter((row) => row.query.trim()).sort((a, b) => b.score - a.score).slice(0, 15);
    if (demand.length === 0) return [];
    const prompt = `Turn the real search-demand queries below into natural questions a customer may ask an answer engine.
Use only the supplied business, category, city, and source queries. Do not invent services, prices, claims, or locations.
Return JSON {"prompts":[{"prompt":"question","sourceQuery":"exact supplied query"}]}. Produce at most two distinct questions per source query.
Business: ${input.businessName}\nCategory: ${input.category}\nCity: ${input.city ?? "not provided"}\nQueries: ${JSON.stringify(demand.map((row) => row.query))}`;
    const raw = await generateContentWithFallback(prompt, { requireJson: true, maxOutputTokens: 2200, temperature: 0.25 });
    let parsed: z.infer<typeof responseSchema> | null = null;
    try { const result = responseSchema.safeParse(JSON.parse(raw)); if (result.success) parsed = result.data; } catch { parsed = null; }
    const byQuery = new Map(demand.map((row) => [row.query.toLowerCase(), row]));
    return (parsed?.prompts ?? []).flatMap((row) => {
        const source = byQuery.get(row.sourceQuery.toLowerCase());
        if (!source) return [];
        const classification = classifyPrompt(row.prompt, [input.businessName]);
        return [{
            promptText: row.prompt,
            intent: classification.intent,
            localeCity: input.city,
            clusterName: PROMPT_CLUSTERS[classification.intent],
            sourceQuery: source.query,
            discoveryScore: Math.max(0, Math.min(1, source.score)),
        }];
    });
}
