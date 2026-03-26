import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { getValidGoogleToken } from "@/services/google/sync-service";
import { upsertQuestionAnswer } from "@/services/google/qanda";
import { syncGbpQuestionsForPlatform } from "@/services/google/phase2-sync";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const questionId = body.questionId as string | undefined;
    const answerText = typeof body.text === "string" ? body.text.trim() : "";

    if (!questionId || !answerText) {
        return NextResponse.json({ error: "questionId and text are required" }, { status: 400 });
    }

    const { data: row, error } = await supabase
        .from("gbp_questions")
        .select("id, business_id, google_question_name, review_platform_id")
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

    const { data: platform, error: platErr } = await supabase
        .from("review_platforms")
        .select("id, platform")
        .eq("id", row.review_platform_id as string)
        .single();

    if (platErr || !platform || platform.platform !== "google") {
        return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    const googleQuestionName = row.google_question_name as string;

    try {
        const { accessToken } = await getValidGoogleToken(platform.id);
        if (!accessToken) {
            return NextResponse.json({ error: "Google token unavailable" }, { status: 401 });
        }

        await upsertQuestionAnswer(accessToken, googleQuestionName, answerText);
        await syncGbpQuestionsForPlatform(platform.id);

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("[QA answer]", msg);
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
