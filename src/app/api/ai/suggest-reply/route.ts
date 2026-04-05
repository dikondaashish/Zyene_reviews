import { createClient } from "@/lib/db/supabase/server";
import { generateContentWithFallback, nextResponseForVertexAiError } from "@/domains/ai/adapters/VertexAdapter";
import { REPLY_PROMPT } from "@/domains/ai/prompts";
import { replySchema } from "@/domains/ai/schemas/ResponseSchemas";
import { aiRateLimit } from "@/lib/auth/rate-limit";
import { checkLimit } from "@/lib/stripe/check-limits";
import { z } from "zod";
import { createRequestLogger } from "@/lib/logger";
import { apiError, apiOk } from "@/app/api/_shared/responses";

const requestSchema = z.object({
    reviewId: z.string().uuid(),
});

interface OrgWithPlan {
    plan: string;
    ai_replies_used_this_month: number;
}

interface ReviewWithBusiness {
    rating: number;
    text: string | null;
    businesses: {
        organization_id: string;
        name: string;
        organizations?: OrgWithPlan | null;
    } | null;
}

export async function POST(request: Request) {
    const { logger, requestId } = createRequestLogger("POST /api/ai/suggest-reply");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError("Unauthorized", { status: 401, details: requestId });

    // Apply Rate Limiting (20 AI replies/min per user)
    const { success: rateLimitSuccess } = await aiRateLimit.limit(user.id);
    if (!rateLimitSuccess) {
        return apiError("AI rate limit exceeded. Please wait a minute.", { status: 429, details: requestId });
    }

    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) return apiError("Review ID required", { status: 400, details: requestId });
    const { reviewId } = parsed.data;

    // Fetch review with business and org info for ownership + limit check
    const { data: review, error } = await supabase
        .from("reviews")
        .select(`
            *,
            businesses!inner(
                name,
                organization_id,
                organizations!inner(
                    id,
                    plan,
                    organization_members!inner(user_id)
                )
            )
        `)
        .eq("id", reviewId)
        .eq("businesses.organizations.organization_members.user_id", user.id)
        .single();

    if (error || !review) return apiError("Review not found", { status: 404, details: requestId });

    // Extract org info for limit check and business name
    const reviewTyped = review as unknown as ReviewWithBusiness;
    const orgId = reviewTyped.businesses?.organization_id;
    if (!orgId) return apiError("Organization not found", { status: 404, details: requestId });

    // Check AI reply limits using the centralized limit checker
    const aiLimitCheck = await checkLimit(orgId, "ai_replies");
    if (!aiLimitCheck.allowed) {
        return apiError("Monthly AI reply limit reached. Please upgrade your plan.", {
            status: 403,
            details: requestId,
        });
    }

    try {
        const businessName = reviewTyped.businesses?.name || "our business";
        const prompt = REPLY_PROMPT
            .replace("{business_name}", businessName)
            .replace("{rating}", review.rating.toString())
            .replace("{text}", review.text || "");

        const plan = reviewTyped.businesses?.organizations?.plan;
        const isPremium = plan === "growth" || String(plan).includes("agency");

        const content = await generateContentWithFallback(prompt, { 
            requireJson: true, 
            schema: replySchema, 
            isPremium
        });
        let result;
        try {
            result = JSON.parse(content);
        } catch (err) {
            console.error("[suggest-reply] JSON.parse failed despite schema:", content);
            return apiOk({ replies: [{ text: content, tone: "professional" }], requestId }, { status: 200 });
        }

        // After successful generative call, increment the counter atomically:
        await supabase.rpc("increment_ai_replies_used", { org_id: orgId });
        logger.info({ userId: user.id, reviewId }, "AI reply suggestions generated");

        return apiOk({ ...result, requestId });

    } catch (error) {
        return nextResponseForVertexAiError(error, "Failed to suggest reply.");
    }
}
