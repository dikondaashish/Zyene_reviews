import { createClient } from "@/lib/db/supabase/server";
import { generateContentWithFallback } from "@/domains/ai/adapters/VertexAdapter";
import { createRequestLogger } from "@/lib/logger";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { Schema, Type as SchemaType } from "@google/genai";

const insightsSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        headline: {
            type: SchemaType.STRING,
            description: "A catchy two-part headline summarizing the overall sentiment. e.g., 'Guests love your brisket. The beans, not so much.'",
        },
        themes: {
            type: SchemaType.ARRAY,
            description: "3 to 5 key themes extracted from all the reviews.",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    name: { type: SchemaType.STRING, description: "Short 2-3 word theme name" },
                    mentions: { type: SchemaType.NUMBER, description: "Estimated number of mentions (1-500 scale based on frequency)" },
                    sentiment: { type: SchemaType.STRING, description: "positive, negative, or neutral" },
                    summaryQuote: { type: SchemaType.STRING, description: "A one sentence summary of what guests say" },
                    customerQuotes: {
                        type: SchemaType.ARRAY,
                        items: { type: SchemaType.STRING },
                        description: "2 real customer quotes supporting this theme",
                    },
                },
                required: ["name", "mentions", "sentiment", "summaryQuote", "customerQuotes"],
            },
        },
        suggestions: {
            type: SchemaType.ARRAY,
            description: "2 to 3 actionable suggestions for the business owner",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    title: { type: SchemaType.STRING, description: "Short actionable title" },
                    urgency: { type: SchemaType.STRING, description: "'Act now' or 'When you can'" },
                    effort: { type: SchemaType.STRING, description: "'Low', 'Medium', or 'High'" },
                    impact: { type: SchemaType.STRING, description: "e.g., '+0.2 avg stars' or '+8% impressions'" },
                    description: { type: SchemaType.STRING, description: "Detailed 1-2 sentence description" },
                },
                required: ["title", "urgency", "effort", "impact", "description"],
            },
        },
    },
    required: ["headline", "themes", "suggestions"],
};

const INSIGHTS_PROMPT = `You are an expert business analyst. Analyze the following customer reviews for a business called "{business_name}".

Extract:
1. **Headline**: Write a catchy two-part headline summarizing the main positive and main negative (or neutral). Separate them with a period.
2. **Key Themes** (3-5): The most prominent recurring themes. Give them short names, estimate their mentions (on a scale up to 500 based on frequency or importance), assign sentiment, write a summary quote, and include exactly two direct quotes from the provided list.
3. **Suggestions** (2-3): Actionable, specific suggestions the business owner can implement to improve. Include an urgency tag, an effort tag, an impact tag, and a detailed description.

Rules:
- Be highly specific. Reference actual patterns from the data (e.g., specific menu items, staff, common complaints).
- Do NOT use generic filler like "improve customer service".
- Write the summary quote in third person.

Reviews ({count} total):
{reviews}`;

export async function GET(request: Request) {
    const { logger, requestId } = createRequestLogger("GET /api/smart/insights");
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
            headline: result.headline || "",
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
