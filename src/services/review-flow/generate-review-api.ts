import { NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/logger";
import { generateContentWithFallback } from "@/domains/ai/adapters/vertex-adapter";
import { aiRateLimit } from "@/lib/auth/rate-limit";
import { createAdminClient } from "@/lib/db/supabase/admin";
import {
    ensureCompleteReviewText,
    isCompleteReviewText,
} from "@/lib/review-flow/ensure-complete-review";
import { buildTagsPromptFragment, tagsForAi } from "@/lib/review-flow/tags-for-ai";

import { checkAiReviewDraftQuota, PLAN_REQUIRED } from "./generate-review-quota";
import {
    buildReviewPrompt,
    buildStaffClause,
    loadRecentReviewsContext,
} from "./generate-review-prompt";

const requestSchema = z.object({
    /** When set, last reviews are loaded only for this request's business (server-resolved). Never trust client businessId for DB reads. */
    reviewRequestId: z.string().uuid().optional(),
    businessId: z.string().uuid().optional(),
    businessName: z.string().min(1).max(200),
    businessCategory: z.string().min(1).max(120),
    rating: z.number().int().min(4).max(5),
    selectedTags: z.array(z.string().min(1).max(200)).min(1).max(20),
    selectedStaff: z.array(z.string().max(120)).max(50).optional(),
});

type AdminClient = ReturnType<typeof createAdminClient>;

async function persistDraft(
    supabase: AdminClient,
    reviewRequestId: string | undefined,
    reviewText: string,
    rating: number,
): Promise<void> {
    if (!reviewRequestId) return;
    await supabase
        .from("review_requests")
        .update({ ai_review_text: reviewText, rating_given: rating })
        .eq("id", reviewRequestId);
}

export async function handleGenerateReviewFlow(request: Request) {
    try {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
            || request.headers.get("x-real-ip")
            || "anonymous";

        try {
            const { success } = await aiRateLimit.limit(ip);
            if (!success) {
                return NextResponse.json(
                    { error: "Too many requests. Please try again in a few minutes." },
                    { status: 429 }
                );
            }
        } catch (e) {
            logger.error({ err: e }, "AI Rate limit check failed:");
        }

        const body = await request.json();
        const parsed = requestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request", details: parsed.error.issues },
                { status: 400 }
            );
        }

        const { reviewRequestId, businessId, businessName, businessCategory, rating, selectedTags, selectedStaff } =
            parsed.data;

        const supabase = createAdminClient();

        const context = reviewRequestId
            ? await loadRecentReviewsContext(supabase, reviewRequestId)
            : { resolvedBusinessId: null, recentReviewsContext: "" };

        const resolvedBusinessId = context.resolvedBusinessId ?? businessId ?? null;
        if (!resolvedBusinessId) {
            return NextResponse.json(PLAN_REQUIRED, { status: 403 });
        }

        const denial = await checkAiReviewDraftQuota(supabase, resolvedBusinessId, reviewRequestId);
        if (denial) return denial;

        const prompt = buildReviewPrompt({
            businessName,
            businessCategory,
            tagContext: buildTagsPromptFragment(tagsForAi(selectedTags), rating),
            staffString: buildStaffClause(selectedStaff),
            recentReviewsContext: context.recentReviewsContext,
        });

        try {
            const generateOnce = async (extraInstruction = "") =>
                generateContentWithFallback(
                    extraInstruction ? `${prompt}\n\n${extraInstruction}` : prompt,
                    {
                        requireJson: false,
                        maxOutputTokens: 1024,
                        temperature: 0.7,
                    }
                );

            let rawText = (await generateOnce()).trim();

            if (!rawText || rawText.length < 10) {
                throw new Error("Empty AI response");
            }

            if (!isCompleteReviewText(rawText)) {
                const retry = (
                    await generateOnce(
                        "IMPORTANT: Your previous answer was cut off mid-sentence. Rewrite the full review as exactly 2-3 complete sentences. End with proper punctuation. Include the full business name in the last sentence."
                    )
                ).trim();
                if (retry.length >= 10) {
                    rawText = retry;
                }
            }

            const reviewText = ensureCompleteReviewText(rawText, businessName);
            await persistDraft(supabase, reviewRequestId, reviewText, rating);

            logger.info({ businessName }, "[AI SUCCESS] Generated review for review flow");
            return NextResponse.json({ reviewText });
        } catch (aiError) {
            logger.error({ err: aiError }, "AI generation failed for review flow:");
            logger.error(`[AI FALLBACK] AI failed. Using Smart Template for ${businessName}.`);

            const fallbackText = ensureCompleteReviewText(
                `Had a wonderful time at ${businessName}. The ${selectedTags.slice(0, 2).join(" and ").toLowerCase()} was fantastic. Highly recommend ${businessName}.`,
                businessName
            );
            await persistDraft(supabase, reviewRequestId, fallbackText, rating);

            return NextResponse.json({ reviewText: fallbackText });
        }
    } catch (error) {
        logger.error({ err: error }, "Review generation error:");
        return NextResponse.json(
            { error: "Failed to generate review" },
            { status: 500 }
        );
    }
}
