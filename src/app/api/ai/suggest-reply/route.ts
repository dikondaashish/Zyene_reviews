import { createClient } from "@/lib/db/supabase/server";
import { nextResponseForVertexAiError } from "@/domains/ai/adapters/VertexAdapter";
import { generateReplyDraftText } from "@/domains/ai/services/generateReplyDraft";
import { aiRateLimit } from "@/lib/auth/rate-limit";
import { checkLimit } from "@/lib/stripe/check-limits";
import { z } from "zod";
import { createRequestLogger } from "@/lib/logger";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { planAllowsAiReviewFeatures } from "@/services/stripe/plans";

const requestSchema = z.object({
    reviewId: z.string().uuid(),
    tone: z.enum(["professional", "friendly", "concise"]).default("professional"),
});

interface OrgWithPlan {
    plan: string;
    plan_status: string | null;
    ai_replies_used_this_month: number;
}

interface ReviewWithBusiness {
    rating: number;
    text: string | null;
    selected_staff?: string[] | null;
    businesses: {
        organization_id: string;
        name: string;
        category?: string | null;
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
    const { reviewId, tone } = parsed.data;

    // Fetch review with business and org info for ownership + limit check
    const { data: review, error } = await supabase
        .from("reviews")
        .select(`
            *,
            businesses!inner(
                name,
                category,
                organization_id,
                organizations!inner(
                    id,
                    plan,
                    plan_status,
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

    const orgPlan = reviewTyped.businesses?.organizations?.plan;
    const orgPlanStatus = reviewTyped.businesses?.organizations?.plan_status ?? null;
    if (!planAllowsAiReviewFeatures(orgPlan, orgPlanStatus)) {
        return apiError("AI reply suggestions require a Starter, Professional, or Enterprise plan.", {
            status: 403,
            code: "AI_REPLY_PLAN_REQUIRED",
            details: requestId,
        });
    }

    // Check AI reply limits using the centralized limit checker
    const aiLimitCheck = await checkLimit(orgId, "smart_replies");
    if (!aiLimitCheck.allowed) {
        return apiError("Monthly AI reply limit reached. Please upgrade your plan.", {
            status: 403,
            details: requestId,
        });
    }

    try {
        const businessName = reviewTyped.businesses?.name || "our business";
        const businessCategory = reviewTyped.businesses?.category?.trim() || "local";
        const plan = reviewTyped.businesses?.organizations?.plan;

        const reply = await generateReplyDraftText({
            businessName,
            businessCategory,
            rating: review.rating,
            reviewText: review.text || "",
            selectedStaff: review.selected_staff,
            tone,
            plan,
        });

        // After successful generative call, increment the counter atomically:
        await supabase.rpc("increment_ai_replies_used", { org_id: orgId });
        logger.info({ userId: user.id, reviewId, tone }, "AI reply suggestion generated");

        return apiOk({ reply, tone, requestId });

    } catch (error) {
        return nextResponseForVertexAiError(error, "Failed to suggest reply.");
    }
}
