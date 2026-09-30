import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { inngest } from "@/services/inngest/client";
import { AI_ANALYSIS_BATCH_SIZE } from "@/services/google/constants";
import { planAllowsAiReviewFeatures } from "@/services/stripe/plans";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";
import { aiAnalysisBackfillRateLimit } from "@/lib/auth/rate-limit";
import { z } from "zod";

const schema = z.object({
    businessId: z.string().uuid(),
    limit: z.number().int().min(1).max(250).default(250),
});

export async function handleSmartAnalyzeBackfill(request: Request) {
    try {
        const { supabase, user } = await requireUser();

        const parsed = schema.safeParse(await request.json());
        if (!parsed.success) {
            return apiError("Invalid request payload", { status: 400 });
        }
        const { businessId, limit } = parsed.data;
        if (!(await canManageBusinessIntegration(supabase, user.id, businessId))) {
            return apiError("Business not found", { status: 404, code: "BUSINESS_NOT_FOUND" });
        }
        const { data: business, error: businessError } = await supabase.from("businesses")
            .select("organizations!inner(plan,plan_status)")
            .eq("id", businessId).maybeSingle();
        if (businessError || !business) {
            return apiError("Business not found", { status: 404, code: "BUSINESS_NOT_FOUND" });
        }
        const org = business.organizations;
        if (!planAllowsAiReviewFeatures(org?.plan ?? null, org?.plan_status ?? null)) {
            return apiError(
                "AI review analysis requires an active Starter, Professional, or Enterprise plan.",
                { status: 403, code: "AI_ANALYSIS_PLAN_REQUIRED" }
            );
        }
        try {
            const { success } = await aiAnalysisBackfillRateLimit.limit(businessId);
            if (!success) return apiError("Daily analysis backfill limit reached", { status: 429 });
        } catch {
            return apiError("Analysis backfill is temporarily unavailable", { status: 503 });
        }

        const { data, error } = await supabase
            .from("reviews")
            .select("id")
            .eq("business_id", businessId)
            .eq("is_visible", true)
            .is("sentiment", null)
            .not("text", "is", null)
            .neq("text", "")
            .order("review_date", { ascending: false })
            .limit(limit);

        if (error) {
            return apiError("Failed to fetch pending analysis reviews", {
                status: 500,
                code: "ANALYSIS_FETCH_FAILED",
                details: error.message
            });
        }

        const reviewIds = (data || []).map((row: { id: string }) => row.id);
        if (reviewIds.length === 0) {
            return apiOk({ queued: 0, batches: 0, message: "No pending reviews for analysis." });
        }

        const chunks: string[][] = [];
        for (let i = 0; i < reviewIds.length; i += AI_ANALYSIS_BATCH_SIZE) {
            chunks.push(reviewIds.slice(i, i + AI_ANALYSIS_BATCH_SIZE));
        }
        await Promise.all(
            chunks.map((chunk) =>
                inngest.send({
                    name: "review/analyze.batch",
                    data: { reviewIds: chunk },
                })
            )
        );
        const batchCount = chunks.length;

        return apiOk({
            queued: reviewIds.length,
            batches: batchCount,
            limit,
            message: "Review analysis backfill queued."
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to start analysis backfill";
        return apiError(message, { status: 500, code: "ANALYSIS_BACKFILL_FAILED" });
    }
}
