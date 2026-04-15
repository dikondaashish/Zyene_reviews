import { Schema, Type as SchemaType } from "@google/genai";
import { generateContentWithFallback } from "@/domains/ai/adapters/VertexAdapter";
import {
    parseCompetitorInsightPayload,
    type CompetitorInsightResult,
} from "@/lib/competitors/competitor-insight-result";

export type { CompetitorInsightResult };

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
        why_it_matters: {
            type: SchemaType.STRING,
            description: "One short sentence on business impact.",
        },
        owner_suggestion: {
            type: SchemaType.STRING,
            description: "Suggested owner: owner, manager, or ops.",
        },
        actions: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    title: { type: SchemaType.STRING },
                    impact: { type: SchemaType.STRING },
                    effort: { type: SchemaType.STRING },
                    priority: { type: SchemaType.STRING },
                },
                required: ["title", "impact", "effort", "priority"],
            },
            description: "Up to 3 actionable items.",
        },
        recommendations: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Up to 3 practical actions.",
        },
    },
    required: ["summary", "priority", "confidence", "why_it_matters", "owner_suggestion", "actions", "recommendations"],
};

export async function generateCompetitorInsight(input: {
    competitorName: string;
    ratingNow: number;
    reviewsNow: number;
    ratingDelta: number;
    reviewsDelta: number;
    events: Array<{ title: string; summary?: string | null; delta?: number | null }>;
}): Promise<CompetitorInsightResult | null> {
    const basePrompt = [
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
        "- why_it_matters: one short sentence.",
        "- owner_suggestion must be one of: owner, manager, ops.",
        "- actions: max 3 objects with title, impact, effort(low|medium|high), priority(low|medium|high).",
        "- priority must be one of: low, medium, high.",
        "- recommendations: max 3 bullets, concrete actions.",
        "- confidence from 0 to 1.",
    ].join("\n");

    const strictRetryPrompt = [
        basePrompt,
        "",
        "IMPORTANT: Output ONLY raw JSON object. No markdown, no prose, no code fences.",
    ].join("\n");

    const fallback: CompetitorInsightResult = {
        summary: `${input.competitorName} moved by ${input.ratingDelta > 0 ? "+" : ""}${input.ratingDelta.toFixed(1)} rating and ${input.reviewsDelta > 0 ? "+" : ""}${input.reviewsDelta} reviews. Monitor this competitor and adjust your local review strategy.`,
        whyItMatters: "This movement can affect customer choice and review momentum in your local market.",
        ownerSuggestion: "manager",
        actions: [
            {
                title: "Launch a 7-day review request push",
                impact: "Improve near-term review velocity and rating defense.",
                effort: "medium",
                priority: "high",
            },
            {
                title: "Audit recent low-rated reviews and response gaps",
                impact: "Reduce conversion risk from unresolved negative feedback.",
                effort: "low",
                priority: "medium",
            },
        ],
        priority:
            Math.abs(input.ratingDelta) >= 0.3 || Math.abs(input.reviewsDelta) >= 20
                ? "high"
                : Math.abs(input.ratingDelta) >= 0.1 || Math.abs(input.reviewsDelta) >= 5
                  ? "medium"
                  : "low",
        confidence: 0.35,
        recommendations: [
            "Review recent competitor feedback themes and identify gaps in your responses.",
            "Increase high-intent review requests this week to defend rating/review momentum.",
        ],
    };

    const tryGenerate = async (prompt: string) => {
        const raw = await generateContentWithFallback(prompt, {
            requireJson: true,
            schema: competitorInsightSchema,
            modelOverride: COMPETITOR_INSIGHT_MODEL,
            maxOutputTokens: 320,
            temperature: 0.25,
        });
        return parseCompetitorInsightPayload(JSON.parse(raw));
    };

    try {
        return await tryGenerate(basePrompt);
    } catch (error) {
        console.warn("[generateCompetitorInsight] primary parse failed, retrying strict:", error);
    }

    try {
        return await tryGenerate(strictRetryPrompt);
    } catch (retryError) {
        console.error("[generateCompetitorInsight] strict retry failed, using safe fallback:", retryError);
        return fallback;
    }
}
