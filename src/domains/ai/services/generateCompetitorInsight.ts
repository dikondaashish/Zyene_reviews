import { Schema, Type as SchemaType } from "@google/genai";
import { generateContentWithFallback } from "@/domains/ai/adapters/VertexAdapter";

const COMPETITOR_INSIGHT_MODEL =
    process.env.GOOGLE_AI_LITE_MODEL?.trim() || "gemini-3.1-flash-lite-preview";

const competitorInsightSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        summary: {
            type: SchemaType.STRING,
            description: "2-4 sentence summary of what changed and why it matters.",
        },
        priority: {
            type: SchemaType.STRING,
            description: "low, medium, or high",
        },
        confidence: {
            type: SchemaType.NUMBER,
            description: "0 to 1 confidence score.",
        },
        recommendations: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Up to 3 practical actions.",
        },
    },
    required: ["summary", "priority", "confidence", "recommendations"],
};

export type CompetitorInsightResult = {
    summary: string;
    priority: "low" | "medium" | "high";
    confidence: number;
    recommendations: string[];
};

function normalizePriority(value: string | null | undefined): "low" | "medium" | "high" {
    const v = String(value || "").toLowerCase().trim();
    if (v === "high") return "high";
    if (v === "medium") return "medium";
    return "low";
}

export async function generateCompetitorInsight(input: {
    competitorName: string;
    ratingNow: number;
    reviewsNow: number;
    ratingDelta: number;
    reviewsDelta: number;
    events: Array<{ title: string; summary?: string | null; delta?: number | null }>;
}): Promise<CompetitorInsightResult | null> {
    const prompt = [
        "You are an analyst for local business competitor monitoring.",
        "Return strictly valid JSON matching the provided schema.",
        "",
        `Competitor: ${input.competitorName}`,
        `Current rating: ${input.ratingNow.toFixed(1)}`,
        `Current review count: ${input.reviewsNow}`,
        `Rating delta (latest): ${input.ratingDelta > 0 ? "+" : ""}${input.ratingDelta.toFixed(1)}`,
        `Review delta (latest): ${input.reviewsDelta > 0 ? "+" : ""}${input.reviewsDelta}`,
        "",
        "Recent events:",
        ...input.events.slice(0, 8).map((e, i) => {
            const deltaPart =
                typeof e.delta === "number" ? ` (delta ${e.delta > 0 ? "+" : ""}${e.delta})` : "";
            return `${i + 1}. ${e.title}${deltaPart}${e.summary ? ` - ${e.summary}` : ""}`;
        }),
        "",
        "Rules:",
        "- summary: concise and actionable.",
        "- priority must be one of: low, medium, high.",
        "- recommendations: max 3 bullets, concrete actions.",
        "- confidence from 0 to 1.",
    ].join("\n");

    try {
        const raw = await generateContentWithFallback(prompt, {
            requireJson: true,
            schema: competitorInsightSchema,
            modelOverride: COMPETITOR_INSIGHT_MODEL,
            maxOutputTokens: 320,
            temperature: 0.25,
        });
        const parsed = JSON.parse(raw) as {
            summary?: string;
            priority?: string;
            confidence?: number;
            recommendations?: string[];
        };
        const summary = String(parsed.summary || "").trim();
        if (!summary) return null;
        const confidenceRaw = Number(parsed.confidence);
        const confidence = Number.isFinite(confidenceRaw)
            ? Math.min(1, Math.max(0, confidenceRaw))
            : 0.5;
        const recommendations = Array.isArray(parsed.recommendations)
            ? parsed.recommendations.map((r) => String(r || "").trim()).filter(Boolean).slice(0, 3)
            : [];
        return {
            summary,
            priority: normalizePriority(parsed.priority),
            confidence,
            recommendations,
        };
    } catch (error) {
        console.error("[generateCompetitorInsight] failed:", error);
        return null;
    }
}
