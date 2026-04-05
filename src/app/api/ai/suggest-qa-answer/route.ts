import { createClient } from "@/lib/db/supabase/server";
import { generateContentWithFallback, nextResponseForVertexAiError } from "@/lib/ai/vertex-client";
import { QA_ANSWER_PROMPT } from "@/services/ai/prompts";
import { NextResponse } from "next/server";
import { qaSchema } from "@/lib/ai/schemas";
import { aiRateLimit } from "@/lib/auth/rate-limit";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";

interface OrgRow {
    plan: string;
    ai_replies_used_this_month: number;
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success: rateOk } = await aiRateLimit.limit(user.id);
    if (!rateOk) {
        return NextResponse.json({ error: "AI rate limit exceeded. Please wait a minute." }, { status: 429 });
    }

    const { questionId } = await request.json();
    if (!questionId) {
        return NextResponse.json({ error: "questionId required" }, { status: 400 });
    }

    const { data: row, error } = await supabase
        .from("gbp_questions")
        .select("id, question_text, business_id")
        .eq("id", questionId)
        .single();

    if (error || !row) {
        return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const businessId = row.business_id as string;
    const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
    if (!allowed) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: biz, error: bizErr } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();

    if (bizErr || !biz?.organization_id) {
        return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const bizTyped = biz as any;
    const orgId = bizTyped.organization_id as string;

    const { data: org, error: orgErr } = await supabase
        .from("organizations")
        .select("plan, ai_replies_used_this_month")
        .eq("id", orgId)
        .single();

    if (orgErr || !org) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
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
        return NextResponse.json(
            { error: "Monthly AI reply limit reached. Please upgrade your plan." },
            { status: 403 }
        );
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
            schema: qaSchema, 
            isPremium,
            enableGrounding: true
        });
        let result: { answer?: string };
        try {
            result = JSON.parse(content) as { answer?: string };
        } catch {
            return NextResponse.json({ answer: content.trim() }, { status: 200 });
        }

        await supabase.rpc("increment_ai_replies_used", { org_id: orgId });

        return NextResponse.json({ answer: result.answer || content.trim() });
    } catch (error) {
        return nextResponseForVertexAiError(error, "Failed to suggest answer.");
    }
}
