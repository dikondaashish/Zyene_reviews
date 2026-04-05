import { generateContentWithFallback } from "@/lib/ai/vertex-client";
import { SENTIMENT_PROMPT } from "./prompts";
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

export async function analyzeReview(review: any) {
    if (!review.content && !review.text) return;

    try {
        const text = review.content || review.text || "";
        const prompt = SENTIMENT_PROMPT
            .replace("{rating}", (review.rating || 0).toString())
            .replace("{text}", text);

        const content = await generateContentWithFallback(prompt, {
            requireJson: true,
            schema: sentimentSchema
        });

        const result = JSON.parse(content);

        const admin = createAdminClient();
        await admin.from("reviews").update({
            sentiment: result.sentiment,
            urgency_score: result.urgency,
            themes: result.themes,
            ai_summary: result.summary,
        }).eq("id", review.id);

        return result;

    } catch (error) {
        console.error("AI Analysis Failed:", error);
        return null;
    }
}
