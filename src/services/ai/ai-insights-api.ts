import { createClient } from "@/lib/db/supabase/server";
import { generateContentWithFallback } from "@/domains/ai/adapters/VertexAdapter";
import { createRequestLogger } from "@/lib/logger";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { AI_INSIGHTS_PROMPT, insightsSchema } from "./insights-schema";

export async function handleAiInsights(_request: Request) {
    const { logger, requestId } = createRequestLogger("GET /api/ai/insights");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError("Unauthorized", { status: 401, details: requestId });

    const { businessId, business } = await getActiveBusinessId();
    if (!businessId) return apiError("No business found", { status: 404, details: requestId });

    const cacheKey = `ai_insights:${businessId}`;
    try {
        const { redis } = await import("@/lib/db/redis");
        const cached = await redis.get(cacheKey);
        if (cached) {
            const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
            logger.info({ userId: user.id, businessId, cached: true }, "AI insights served from cache");
            return apiOk(parsed);
        }
    } catch {
        // Redis unavailable, continue without cache
    }

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

        const prompt = AI_INSIGHTS_PROMPT
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

        try {
            const { redis } = await import("@/lib/db/redis");
            await redis.set(cacheKey, JSON.stringify(responseData), { ex: 86400 });
        } catch {
            // Cache write failed, non-critical
        }

        logger.info({ userId: user.id, businessId, reviewCount: count }, "AI insights generated");
        return apiOk(responseData);
    } catch (error) {
        logger.error({ error, userId: user.id, businessId }, "AI insights generation failed");
        return apiError("Failed to generate insights", { status: 500, details: requestId });
    }
}
