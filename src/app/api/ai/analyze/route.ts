import { createClient } from "@/lib/db/supabase/server";
import { analyzeReview } from "@/domains/ai/services/ai-analysis-service";
import { z } from "zod";
import { createRequestLogger } from "@/lib/logger";
import { apiError, apiOk } from "@/app/api/_shared/responses";

const analyzeSchema = z.object({
    reviewId: z.string().uuid(),
});

export async function POST(request: Request) {
    const { logger, requestId } = createRequestLogger("POST /api/ai/analyze");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError("Unauthorized", { status: 401, details: requestId });

    const parsed = analyzeSchema.safeParse(await request.json());
    if (!parsed.success) {
        return apiError("Invalid request payload", { status: 400, details: requestId });
    }

    const { reviewId } = parsed.data;

    const { data: review } = await supabase
        .from("reviews")
        .select("*")
        .eq("id", reviewId)
        .single();

    if (!review) return apiError("Review not found", { status: 404, details: requestId });

    const result = await analyzeReview(review);
    logger.info({ userId: user.id, reviewId }, "Review analysis completed");

    return apiOk({ analysis: result, requestId });
}
