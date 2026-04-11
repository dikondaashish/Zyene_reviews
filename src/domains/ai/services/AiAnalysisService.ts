import { generateContentWithFallback } from "@/domains/ai/adapters/VertexAdapter";
import {
    normalizeSentimentForDb,
    normalizeThemesForDb,
    normalizeUrgencyForDb,
} from "@/domains/ai/normalizeAnalysisForDb";
import { SENTIMENT_PROMPT } from "@/domains/ai/prompts";
import { createAdminClient } from "@/lib/db/supabase/admin";

const SENTIMENT_JSON_SHAPE = `Return a single JSON object with keys: sentiment (string: positive|negative|neutral|mixed), urgency (number 1-10), themes (string array), summary (one sentence string).`;

const CATEGORY_JSON_SHAPE = `Return a single JSON object: {"category":"<2-3 word category>"} such as Customer Service, Wait Time, Product Quality, Pricing, or Other.`;

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
        const prompt = `${SENTIMENT_PROMPT
            .replace("{rating}", (review.rating || 0).toString())
            .replace("{text}", text)}

${SENTIMENT_JSON_SHAPE}`;

        const content = await generateContentWithFallback(prompt, {
            requireJson: true,
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
        const prompt = `Analyze this private customer feedback and categorize the primary issue into a short phrase (2-3 words max, e.g., 'Customer Service', 'Product Quality', 'Wait Time', 'Pricing', etc.).

Feedback: "${content}"

${CATEGORY_JSON_SHAPE}`;
        const res = await generateContentWithFallback(prompt, {
            requireJson: true,
        });
        const parsed = JSON.parse(res);
        return parsed.category || "Other";
    } catch (err) {
        console.error("AI Categorize Failed:", err);
        return "Other";
    }
}
