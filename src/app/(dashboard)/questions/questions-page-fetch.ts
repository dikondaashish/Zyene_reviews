import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import type { GbpQuestionRow } from "@/components/questions/questions-page-client";

export async function fetchQuestionsPageData(
    supabase: Awaited<ReturnType<typeof createClient>>,
    businessId: string,
): Promise<{ questions: GbpQuestionRow[]; failed: boolean }> {
    const { data, error } = await supabase
        .from("gbp_questions")
        .select(
            "id, question_text, author_display_name, google_update_time, total_answer_count, has_merchant_answer, upvote_count"
        )
        .eq("business_id", businessId)
        .order("google_update_time", { ascending: false, nullsFirst: false });

    if (error) {
        logger.error({ err: error }, "[questions page]");
        return { questions: [], failed: true };
    }
    return { questions: data ?? [], failed: false };
}
