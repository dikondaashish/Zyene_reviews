import { NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/logger";
import { generateContentWithFallback } from "@/domains/ai/adapters/vertex-adapter";
import {
    clientIpFrom,
    publicAiDraftBusinessRateLimit,
    publicAiDraftIpRateLimit,
    publicAiDraftRequestRateLimit,
} from "@/lib/auth/rate-limit";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { verifyReviewTracking } from "@/lib/review-requests/tracking-token";
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
    reviewRequestId: z.string().uuid(),
    businessId: z.string().uuid(),
    token: z.string().min(1),
    businessName: z.string().min(1).max(200),
    businessCategory: z.string().min(1).max(120),
    rating: z.number().int().min(4).max(5),
    selectedTags: z.array(z.string().min(1).max(200)).min(1).max(20),
    selectedStaff: z.array(z.string().max(120)).max(50).optional(),
});

type AdminClient = ReturnType<typeof createAdminClient>;

async function persistDraft(
    supabase: AdminClient,
    reviewRequestId: string,
    reviewText: string,
    rating: number,
): Promise<void> {
    const { data, error } = await supabase
        .from("review_requests")
        .update({ ai_review_text: reviewText, rating_given: rating })
        .eq("id", reviewRequestId)
        .select("id")
        .maybeSingle();
    if (error || !data) throw error ?? new Error("Review draft was not saved");
}

export async function handleGenerateReviewFlow(request: Request) {
    try {
        try {
            const { success } = await publicAiDraftIpRateLimit.limit(clientIpFrom(request));
            if (!success) {
                return NextResponse.json(
                    { error: "Too many requests. Please try again in a few minutes." },
                    { status: 429 }
                );
            }
        } catch (e) {
            logger.error({ err: e }, "AI Rate limit check failed:");
            return NextResponse.json({ error: "AI drafts are temporarily unavailable." }, { status: 503 });
        }

        const body = await request.json();
        const parsed = requestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request", details: parsed.error.issues },
                { status: 400 }
            );
        }

        const { reviewRequestId, businessId, token, businessName, businessCategory, rating, selectedTags, selectedStaff } =
            parsed.data;

        if (!verifyReviewTracking(reviewRequestId, businessId, token)) {
            return NextResponse.json({ error: "Invalid review link" }, { status: 403 });
        }

        const supabase = createAdminClient();

        const context = await loadRecentReviewsContext(supabase, reviewRequestId);
        const resolvedBusinessId = context.resolvedBusinessId;
        if (!resolvedBusinessId || businessId !== resolvedBusinessId) {
            return NextResponse.json(PLAN_REQUIRED, { status: 403 });
        }

        try {
            const [businessLimit, requestLimit] = await Promise.all([
                publicAiDraftBusinessRateLimit.limit(resolvedBusinessId),
                publicAiDraftRequestRateLimit.limit(reviewRequestId),
            ]);
            if (!businessLimit.success || !requestLimit.success) {
                return NextResponse.json({ error: "AI draft limit reached. Please try again later." }, { status: 429 });
            }
        } catch (error) {
            logger.error({ err: error }, "AI draft budget check failed:");
            return NextResponse.json({ error: "AI drafts are temporarily unavailable." }, { status: 503 });
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
