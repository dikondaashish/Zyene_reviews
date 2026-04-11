import { createClient } from "@/lib/db/supabase/server";
import { generateContentWithFallback, nextResponseForVertexAiError } from "@/domains/ai/adapters/VertexAdapter";
import { QA_ANSWER_PROMPT } from "@/domains/ai/prompts";
import { aiRateLimit } from "@/lib/auth/rate-limit";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { z } from "zod";
import { createRequestLogger } from "@/lib/logger";
import { apiError, apiOk } from "@/app/api/_shared/responses";

const requestSchema = z.object({
    questionId: z.string().uuid(),
});

interface OrgRow {
    plan: string;
    ai_replies_used_this_month: number;
}

interface BusinessRow {
    organization_id: string;
    knowledge_base: string | null;
    name: string | null;
}

export async function POST(request: Request) {
    const { logger, requestId } = createRequestLogger("POST /api/ai/suggest-qa-answer");
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return apiError("Unauthorized", { status: 401, details: requestId });
    }

    const { success: rateOk } = await aiRateLimit.limit(user.id);
    if (!rateOk) {
        return apiError("AI rate limit exceeded. Please wait a minute.", { status: 429, details: requestId });
    }

    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
        return apiError("questionId is required", { status: 400, details: requestId });
    }

    const { questionId } = parsed.data;

    const { data: row, error } = await supabase
        .from("gbp_questions")
        .select("id, question_text, business_id")
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

    const { data: biz, error: bizErr } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();

    if (bizErr || !biz?.organization_id) {
        return apiError("Business not found", { status: 404, details: requestId });
    }

    const bizTyped = biz as unknown as BusinessRow;
    const orgId = bizTyped.organization_id as string;

    const { data: org, error: orgErr } = await supabase
        .from("organizations")
        .select("plan, ai_replies_used_this_month")
        .eq("id", orgId)
        .single();

    if (orgErr || !org) {
        return apiError("Organization not found", { status: 404, details: requestId });
    }

    const planLimits: Record<string, number> = {
        free: 0,
        starter: 50,
        growth: 200,
        agency_starter: 500,
        agency_pro: 1000,
        agency_scale: 9999,
    };

    const orgTyped = org as unknown as OrgRow;
    const limit = planLimits[orgTyped.plan] ?? 0;
    if (orgTyped.ai_replies_used_this_month >= limit) {
        return apiError("Monthly AI reply limit reached. Please upgrade your plan.", { status: 403, details: requestId });
    }

    const knowledgeBase = (bizTyped.knowledge_base as string) || "No special knowledge base provided.";
    const businessName = (bizTyped.name as string) || "our business";
    const qText = (row.question_text as string) || "";

    const prompt = QA_ANSWER_PROMPT
        .replace("{business_name}", businessName)
        .replace("{question_text}", qText.replace(/"/g, '\\"'))
        .replace("{knowledge_base}", knowledgeBase);

    try {
        const isPremium = orgTyped.plan === "growth" || String(orgTyped.plan).includes("agency");
        const content = await generateContentWithFallback(prompt, {
            requireJson: true,
            isPremium,
            enableGrounding: true,
        });
        let result: { answer?: string };
        try {
            result = JSON.parse(content) as { answer?: string };
        } catch {
            return apiOk({ answer: content.trim(), requestId }, { status: 200 });
        }

        await supabase.rpc("increment_ai_replies_used", { org_id: orgId });
        logger.info({ userId: user.id, questionId }, "AI QA answer generated");

        return apiOk({ answer: result.answer || content.trim(), requestId });
    } catch (error) {
        return nextResponseForVertexAiError(error, "Failed to suggest answer.");
    }
}
