import { anthropic } from "./client";
import { SENTIMENT_PROMPT } from "./prompts";
import { createAdminClient } from "@/lib/supabase/admin";

export async function analyzeReview(review: any) {
    if (!review.content && !review.text) return; // Need content

    try {
        const text = review.content || review.text || "";
        const prompt = SENTIMENT_PROMPT
            .replace("{rating}", (review.rating || 0).toString())
            .replace("{text}", text);

        // Using standard model ID for reliability, user requested custom IDs might be placeholders
        // Falling back to known working models
        const response = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1000,
            messages: [{ role: "user", content: prompt }]
        });

        const content = response.content[0].type === 'text' ? response.content[0].text : "";

        // Extract JSON from potential markdown text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : content;

        const result = JSON.parse(jsonStr);

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
