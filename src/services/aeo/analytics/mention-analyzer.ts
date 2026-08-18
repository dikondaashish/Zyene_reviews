import { z } from "zod";
import { generateContentWithFallback } from "@/domains/ai/adapters/vertex-adapter";

const attributeSchema = z.object({
    name: z.enum(["price", "speed", "quality", "service", "reliability", "convenience", "other"]),
    polarity: z.enum(["positive", "negative", "neutral"]),
    evidence: z.string().trim().min(1).max(300),
});

const analysisSchema = z.object({
    mentions: z.array(z.object({
        brand: z.string().trim().min(1).max(200),
        sentiment: z.enum(["positive", "neutral", "negative"]),
        rationale: z.string().trim().min(1).max(500),
        attributes: z.array(attributeSchema).max(12),
    })).max(20),
});

export type MentionAnalysis = z.infer<typeof analysisSchema>["mentions"][number];

export function parseMentionAnalysis(raw: string, allowedBrands: readonly string[]): MentionAnalysis[] {
    let value: unknown;
    try {
        value = JSON.parse(raw);
    } catch {
        return [];
    }
    const parsed = analysisSchema.safeParse(value);
    if (!parsed.success) return [];
    const allowed = new Set(allowedBrands.map((brand) => brand.toLowerCase()));
    return parsed.data.mentions.filter((item) => allowed.has(item.brand.toLowerCase()));
}

/** Sentiment cannot influence visibility; allowed brands come from deterministic extraction. */
export async function analyzeMentions(input: {
    answerText: string;
    brandLabels: readonly string[];
}): Promise<MentionAnalysis[]> {
    if (input.brandLabels.length === 0) return [];
    const prompt = `Analyze only the named brands listed below in the answer. Do not add brands.
Return JSON: {"mentions":[{"brand":"exact label","sentiment":"positive|neutral|negative","rationale":"one evidence-based sentence","attributes":[{"name":"price|speed|quality|service|reliability|convenience|other","polarity":"positive|negative|neutral","evidence":"exact short phrase"}]}]}.
Brands: ${JSON.stringify(input.brandLabels)}
Answer: ${input.answerText.slice(0, 12_000)}`;
    const raw = await generateContentWithFallback(prompt, {
        requireJson: true,
        maxOutputTokens: 1600,
        temperature: 0,
    });
    return parseMentionAnalysis(raw, input.brandLabels);
}
