import { z } from "zod";
import { createClient } from "@/lib/db/supabase/server";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";
import { aiRateLimit } from "@/lib/auth/rate-limit";
import { analyzeReview } from "@/domains/ai/services/ai-analysis-service";
import { planAllowsAiReviewFeatures } from "@/services/stripe/plans";
import { apiError, apiOk } from "@/app/api/_shared/responses";

const schema = z.object({ reviewId: z.string().uuid() });

export async function handleReviewAnalysis(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return apiError("Unauthorized", { status: 401 });

        const parsed = schema.safeParse(await request.json());
        if (!parsed.success) return apiError("Invalid request payload", { status: 400 });

        const { data: review, error } = await supabase.from("reviews")
            .select("*").eq("id", parsed.data.reviewId).maybeSingle();
        if (error || !review?.business_id ||
            !(await canManageBusinessIntegration(supabase, user.id, review.business_id))) {
            return apiError("Review not found", { status: 404 });
        }

        const { data: business, error: businessError } = await supabase.from("businesses")
            .select("organizations!inner(plan,plan_status)")
            .eq("id", review.business_id).maybeSingle();
        const org = business?.organizations;
        if (businessError || !org ||
            !planAllowsAiReviewFeatures(org.plan, org.plan_status)) {
            return apiError("AI review analysis requires an active plan", {
                status: 403, code: "AI_ANALYSIS_PLAN_REQUIRED",
            });
        }

        const { success } = await aiRateLimit.limit(user.id);
        if (!success) return apiError("Too many analysis requests", { status: 429 });

        const result = await analyzeReview(review);
        return apiOk({ analysis: result });
    } catch {
        return apiError("Analysis is temporarily unavailable", { status: 503 });
    }
}
