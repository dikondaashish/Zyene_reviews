import { createClient } from "@/lib/db/supabase/server";
import { generateContentWithFallback } from "@/domains/ai/adapters/VertexAdapter";
import { createRequestLogger } from "@/lib/logger";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { Schema, Type as SchemaType } from "@google/genai";

const insightsSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        themes: {
            type: SchemaType.ARRAY,
            description: "3 to 5 key themes extracted from all the reviews",
            items: { type: SchemaType.STRING },
        },
        suggestions: {
            type: SchemaType.ARRAY,
            description: "2 to 3 actionable suggestions for the business owner",
            items: { type: SchemaType.STRING },
        },
    },
    required: ["themes", "suggestions"],
};

const INSIGHTS_PROMPT = `You are an expert business analyst. Analyze the following customer reviews for a business called "{business_name}".

Extract:
1. **Key Themes** (3-5): The most prominent recurring themes across all reviews. Each theme should be a single sentence describing what customers frequently mention — both positive and negative patterns.
2. **Suggestions** (2-3): Actionable, specific suggestions the business owner can implement to improve their ratings or capitalize on strengths.

Rules:
- Be specific. Reference actual patterns you see (e.g., specific menu items, staff names, common complaints).
- Do NOT use generic filler like "improve customer service". Be concrete.
- Write in third person (e.g., "Customers frequently praise..." not "Your customers...").
- Keep each theme and suggestion to one clear sentence.

Reviews ({count} total):
{reviews}`;

export async function GET(request: Request) {
    const { logger, requestId } = createRequestLogger("GET /api/ai/insights");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError("Unauthorized", { status: 401, details: requestId });

    const { businessId, business } = await getActiveBusinessId();
    if (!businessId) return apiError("No business found", { status: 404, details: requestId });

    // Check cache first (Redis, 24h TTL)
    const cacheKey = `ai_insights:${businessId}`;
    try {
        const { redis } = await import("@/lib/db/redis");
        const cached = await redis.get(cacheKey);
        if (cached) {
            const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
            logger.info({ userId: user.id, businessId, cached: true }, "AI insights served from cache");
            return apiOk(parsed);
        }
    } catch (e) {
        // Redis unavailable, continue without cache
    }

    // Fetch review texts (sample up to 200 most recent with text)
    const { data: reviews, count } = await supabase
        .from("reviews")
        .select("text, rating", { count: "exact" })
        .eq("business_id", businessId)
        .not("text", "is", null)
        .neq("text", "")
        .order("review_date", { ascending: false })
        .limit(200);

    if (!reviews || reviews.length < 5) {
        return apiOk({
            themes: [],
            suggestions: [],
            reviewCount: count || 0,
            message: "Not enough reviews with text to generate insights. At least 5 reviews needed.",
        });
    }

    try {
        const reviewsText = reviews
            .map((r, i) => `[${i + 1}] (${r.rating}★) ${r.text}`)
            .join("\n");

        const prompt = INSIGHTS_PROMPT
            .replace("{business_name}", business?.name || "the business")
            .replace("{count}", (count || reviews.length).toString())
            .replace("{reviews}", reviewsText);

        const content = await generateContentWithFallback(prompt, {
            requireJson: true,
            schema: insightsSchema,
        });

        let result;
        try {
            result = JSON.parse(content);
        } catch {
            return apiError("Failed to parse AI response", { status: 500, details: requestId });
        }

        const responseData = {
            themes: result.themes || [],
            suggestions: result.suggestions || [],
            reviewCount: count || reviews.length,
        };

        // Cache for 24 hours
        try {
            const { redis } = await import("@/lib/db/redis");
            await redis.set(cacheKey, JSON.stringify(responseData), { ex: 86400 });
        } catch (e) {
            // Cache write failed, non-critical
        }

        logger.info({ userId: user.id, businessId, reviewCount: count }, "AI insights generated");
        return apiOk(responseData);
    } catch (error) {
        logger.error({ error, userId: user.id, businessId }, "AI insights generation failed");
        return apiError("Failed to generate insights", { status: 500, details: requestId });
    }
}
