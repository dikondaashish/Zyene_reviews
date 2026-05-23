import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { inngest } from "@/services/inngest/client";
import { AI_ANALYSIS_BATCH_SIZE } from "@/services/google/constants";
import { planAllowsAiReviewFeatures } from "@/services/stripe/plans";

const DEFAULT_LIMIT = 500;
const MAX_LIMIT = 2000;

export async function handleSmartAnalyzeBackfill(request: Request) {
    try {
        const { supabase, user } = await requireUser();

        let requestedLimit = DEFAULT_LIMIT;
        let requestedBusinessId: string | undefined;
        try {
            const body = await request.json();
            if (typeof body?.limit === "number" && Number.isFinite(body.limit)) {
                requestedLimit = body.limit;
            }
            if (typeof body?.businessId === "string" && body.businessId.trim()) {
                requestedBusinessId = body.businessId.trim();
            }
        } catch {
            // no body provided
        }

        const limit = Math.max(1, Math.min(MAX_LIMIT, Math.floor(requestedLimit)));

        const { data: memberData, error: memberError } = await supabase
            .from("organization_members")
            .select(`
                organizations (
                    plan,
                    plan_status,
                    businesses (
                        id
                    )
                )
            `)
            .eq("user_id", user.id)
            .single();

        if (memberError || !memberData) {
            return apiError("Business not found", { status: 404, code: "BUSINESS_NOT_FOUND" });
        }

        const typed = memberData as { organizations?: { plan?: string | null; plan_status?: string | null; businesses?: Array<{ id: string }> } };
        if (!planAllowsAiReviewFeatures(typed.organizations?.plan ?? null, typed.organizations?.plan_status ?? null)) {
            return apiError(
                "AI review analysis requires an active Starter, Professional, or Enterprise plan.",
                { status: 403, code: "AI_ANALYSIS_PLAN_REQUIRED" }
            );
        }
        const businesses = (typed.organizations?.businesses || []) as Array<{ id: string }>;
        const business = requestedBusinessId
            ? businesses.find((entry) => entry.id === requestedBusinessId)
            : businesses[0];
        const businessId = business?.id;
        if (!businessId) {
            return apiError("Business not found", { status: 404, code: "BUSINESS_NOT_FOUND" });
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
