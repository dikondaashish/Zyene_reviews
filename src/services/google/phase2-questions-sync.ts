import * as Sentry from "@sentry/nextjs";

import { createAdminClient } from "@/lib/db/supabase/admin";
import { logger } from "@/lib/logger";

import { listAllQuestions, questionToRow } from "./qanda";
import { getValidGoogleToken } from "./sync-service";

/** Sync all Q&A questions for a Google-connected platform. */
export async function syncGbpQuestionsForPlatform(platformId: string): Promise<{
    success: boolean;
    count: number;
    error?: string;
}> {
    const admin = createAdminClient();
    const { data: platform, error: platformError } = await admin
        .from("review_platforms")
        .select("id, business_id, platform, google_location_id, google_qa_unavailable")
        .eq("id", platformId)
        .single();

    if (platformError || !platform || platform.platform !== "google" || !platform.google_location_id) {
        return { success: false, count: 0, error: "Invalid Google platform" };
    }
    if (platform.google_qa_unavailable) return { success: true, count: 0 };

    try {
        const { accessToken } = await getValidGoogleToken(platformId);
        if (!accessToken) throw new Error("No access token");

        const questions = await listAllQuestions(accessToken, platform.google_location_id);
        const rows = questions.map((question) =>
            questionToRow(question, platformId, platform.business_id)
        );

        if (rows.length === 0) {
            await admin
                .from("review_platforms")
                .update({ google_qa_synced_at: new Date().toISOString(), google_qa_unavailable: true })
                .eq("id", platformId);
            return { success: true, count: 0 };
        }

        const batchSize = 50;
        const upsertResults = await Promise.all(
            Array.from({ length: Math.ceil(rows.length / batchSize) }, (_, index) =>
                admin.from("gbp_questions").upsert(rows.slice(index * batchSize, index * batchSize + batchSize), {
                    onConflict: "review_platform_id,google_question_name",
                })
            )
        );
        for (const { error } of upsertResults) {
            if (error) {
                logger.error({ err: error }, "[Phase2] gbp_questions upsert:");
                Sentry.captureException(error);
                throw error;
            }
        }

        await admin
            .from("review_platforms")
            .update({ google_qa_synced_at: new Date().toISOString(), google_qa_unavailable: false })
            .eq("id", platformId);
        return { success: true, count: rows.length };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        const apiUnsupported =
            /\b501\b/.test(message) &&
            (/API_UNSUPPORTED|UNIMPLEMENTED|no longer supported/i.test(message) ||
                /mybusinessqanda\.googleapis\.com/i.test(message));
        if (apiUnsupported) {
            const { error: updateError } = await admin
                .from("review_platforms")
                .update({ google_qa_synced_at: new Date().toISOString(), google_qa_unavailable: true })
                .eq("id", platformId);
            if (updateError) {
                logger.error({ err: updateError }, "[Phase2] Failed to persist google_qa_unavailable:");
            }
            return { success: true, count: 0 };
        }
        logger.error({ err: message }, "[Phase2] Q&A sync failed:");
        Sentry.captureException(error);
        return { success: false, count: 0, error: message };
    }
}
