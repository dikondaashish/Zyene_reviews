import { generateContentWithFallback } from "@/domains/ai/adapters/VertexAdapter";
import {
    normalizeSentimentForDb,
    normalizeThemesForDb,
    normalizeUrgencyForDb,
} from "@/domains/ai/normalizeAnalysisForDb";
import { SENTIMENT_PROMPT } from "@/domains/ai/prompts";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { Schema, Type as SchemaType } from "@google/genai";

const sentimentSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        sentiment: { type: SchemaType.STRING, description: "positive, negative, neutral, or mixed" },
        urgency: { type: SchemaType.NUMBER, description: "1-10 urgency score" },
        themes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        summary: { type: SchemaType.STRING, description: "One sentence summary" }
    },
    required: ["sentiment", "urgency", "themes", "summary"]
};

/** Cheap classification model for single-review tasks. Override via env if your region uses a different id. */
const LITE_MODEL =
    process.env.GOOGLE_AI_LITE_MODEL?.trim() || "gemini-3.1-flash-lite-preview";

const categorySchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        category: { 
            type: SchemaType.STRING, 
            description: "A short category (2-3 words max). E.g. 'Customer Service', 'Wait Time', 'Product Quality', 'Pricing', or 'Other'" 
        }
    },
    required: ["category"]
};

type ReviewForAnalysis = {
    id: string;
    rating?: number | null;
    content?: string | null;
    text?: string | null;
};

type SentimentAnalysisResult = {
    sentiment: string;
    urgency: number;
    themes: string[];
    summary: string;
};

export async function analyzeReview(review: ReviewForAnalysis): Promise<SentimentAnalysisResult | null | undefined> {
    if (!review.content && !review.text) return;

    try {
        const text = review.content || review.text || "";
        const prompt = SENTIMENT_PROMPT
            .replace("{rating}", (review.rating || 0).toString())
            .replace("{text}", text);

        const content = await generateContentWithFallback(prompt, {
            requireJson: true,
            schema: sentimentSchema,
            modelOverride: LITE_MODEL,
            maxOutputTokens: 256,
            temperature: 0.3,
        });

        const parsed = JSON.parse(content) as SentimentAnalysisResult;

        const admin = createAdminClient();
        await admin.from("reviews").update({
            sentiment: normalizeSentimentForDb(parsed.sentiment),
            urgency_score: normalizeUrgencyForDb(parsed.urgency),
            themes: normalizeThemesForDb(parsed.themes),
            ai_summary: parsed.summary ?? "",
        }).eq("id", review.id);

        return parsed;

    } catch (error) {
        console.error("AI Analysis Failed:", error);
        return null;
    }
}

export async function categorizePrivateFeedback(content: string | null | undefined): Promise<string> {
    if (!content || !content.trim()) return "Other";
    try {
        const prompt = `Analyze this private customer feedback and categorize the primary issue into a short phrase (2-3 words max, e.g., 'Customer Service', 'Product Quality', 'Wait Time', 'Pricing', etc.).\n\nFeedback: "${content}"`;
        const res = await generateContentWithFallback(prompt, {
            requireJson: true,
            schema: categorySchema,
            modelOverride: LITE_MODEL,
            maxOutputTokens: 128,
            temperature: 0.35,
        });
        const parsed = JSON.parse(res);
        return parsed.category || "Other";
    } catch (err) {
        console.error("AI Categorize Failed:", err);
        return "Other";
    }
}
