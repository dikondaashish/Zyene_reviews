import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { getValidGoogleToken } from "@/services/google/sync-service";
import { upsertQuestionAnswer } from "@/services/google/qanda";
import { syncGbpQuestionsForPlatform } from "@/services/google/phase2-sync";
import { z } from "zod";
import { createRequestLogger } from "@/lib/logger";
import { apiError, apiOk } from "@/app/api/_shared/responses";

const answerSchema = z.object({
    questionId: z.string().uuid(),
    text: z.string().trim().min(1).max(5000),
});

export async function POST(request: Request) {
    const { logger, requestId } = createRequestLogger("POST /api/google/qa/answer");
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return apiError("Unauthorized", { status: 401, details: requestId });
    }

    const parsed = answerSchema.safeParse(await request.json());
    if (!parsed.success) {
        return apiError("questionId and text are required", { status: 400, details: requestId });
    }

    const { questionId, text: answerText } = parsed.data;

    const { data: row, error } = await supabase
        .from("gbp_questions")
        .select("id, business_id, google_question_name, review_platform_id")
        .eq("id", questionId)
        .single();

    if (error || !row) {
        return apiError("Question not found", { status: 404, details: requestId });
    }

    const businessId = row.business_id as string;
    const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
    if (!allowed) {
        return apiError("Forbidden", { status: 403, details: requestId });
    }

    const { data: platform, error: platErr } = await supabase
        .from("review_platforms")
        .select("id, platform")
        .eq("id", row.review_platform_id as string)
        .single();

    if (platErr || !platform || platform.platform !== "google") {
        return apiError("Invalid platform", { status: 400, details: requestId });
    }

    const googleQuestionName = row.google_question_name as string;

    try {
        const { accessToken } = await getValidGoogleToken(platform.id);
        if (!accessToken) {
            return apiError("Google token unavailable", { status: 401, details: requestId });
        }

        await upsertQuestionAnswer(accessToken, googleQuestionName, answerText);
        await syncGbpQuestionsForPlatform(platform.id);
        logger.info({ userId: user.id, questionId, platformId: platform.id }, "Google QA answer upserted");

        return apiOk({ requestId });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        logger.error({ err: msg }, "[QA answer]");
        return apiError(msg, { status: 400, details: requestId });
    }
}
