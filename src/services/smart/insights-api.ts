import { createClient } from "@/lib/db/supabase/server";
import { generateContentWithFallback } from "@/domains/ai/adapters/VertexAdapter";
import { createRequestLogger } from "@/lib/logger";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { countVisibleReviewsForBusiness } from "@/lib/reviews/count-visible-reviews";
import { INSIGHTS_PROMPT, insightsSchema } from "./insights-schema";

export async function handleSmartInsightsGet(_request: Request) {
    const { logger, requestId } = createRequestLogger("GET /api/smart/insights");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError("Unauthorized", { status: 401, details: requestId });

    const { businessId, business } = await getActiveBusinessId();
    if (!businessId) return apiError("No business found", { status: 404, details: requestId });

    const cacheKey = `ai_insights_v3:${businessId}`;
    try {
        const { redis } = await import("@/lib/db/redis");
        const cached = await redis.get(cacheKey);
        if (cached) {
            const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
            logger.info({ userId: user.id, businessId, cached: true }, "AI insights served from cache");
            return apiOk(parsed);
        }
    } catch {
        /* Redis unavailable */
    }

    const [{ count: visibleReviewTotal }, { data: reviews }] = await Promise.all([
        countVisibleReviewsForBusiness(supabase, businessId),
        supabase
            .from("reviews")
            .select("text, rating")
            .eq("business_id", businessId)
            .eq("is_visible", true)
            .not("text", "is", null)
            .neq("text", "")
            .order("review_date", { ascending: false })
            .limit(200),
    ]);

    if (!reviews || reviews.length < 5) {
        return apiOk({
            themes: [],
            suggestions: [],
            reviewCount: visibleReviewTotal,
            message: "Not enough reviews with text to generate insights. At least 5 reviews needed.",
        });
    }

    try {
        const reviewsText = reviews
            .map((r, i) => `[${i + 1}] (${r.rating}★) ${r.text}`)
            .join("\n");

        const prompt = INSIGHTS_PROMPT
            .replace("{business_name}", business?.name || "the business")
            .replace("{count}", String(visibleReviewTotal))
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
            headline: result.headline || "",
            themes: result.themes || [],
            suggestions: result.suggestions || [],
            reviewCount: visibleReviewTotal,
        };

        try {
            const { redis } = await import("@/lib/db/redis");
            await redis.set(cacheKey, JSON.stringify(responseData), { ex: 86400 });
        } catch {
            /* non-critical */
        }

        logger.info({ userId: user.id, businessId, reviewCount: visibleReviewTotal }, "AI insights generated");
        return apiOk(responseData);
    } catch (error) {
        logger.error({ error, userId: user.id, businessId }, "AI insights generation failed");
        return apiError("Failed to generate insights", { status: 500, details: requestId });
    }
}
