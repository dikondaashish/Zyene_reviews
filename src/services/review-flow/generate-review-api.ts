import { logger } from "@/lib/logger";
import { generateContentWithFallback } from "@/domains/ai/adapters/VertexAdapter";
import { NextResponse } from "next/server";
import { z } from "zod";
import { aiRateLimit } from "@/lib/auth/rate-limit";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { planAllowsAiReviewFeatures } from "@/services/stripe/plans";
import {
    ensureCompleteReviewText,
    isCompleteReviewText,
} from "@/lib/review-flow/ensure-complete-review";
import { buildTagsPromptFragment, tagsForAi } from "@/lib/review-flow/tags-for-ai";

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
        const tagContext = buildTagsPromptFragment(tagsForAi(selectedTags), rating);
        const staffString =
            selectedStaff && selectedStaff.length > 0
                ? ` They also specifically wanted to highlight the great service from their staff member(s): ${selectedStaff.join(" and ")}.`
                : "";

        let recentReviewsContext = "";
        let resolvedBusinessId: string | null = null;
        if (reviewRequestId) {
            try {
                const supabase = createAdminClient();
                const { data: rr, error: rrErr } = await supabase
                    .from("review_requests")
                    .select("business_id")
                    .eq("id", reviewRequestId)
                    .maybeSingle();

                if (!rrErr && rr?.business_id) {
                    resolvedBusinessId = rr.business_id;
                    const { data: reviews } = await supabase
                        .from("reviews")
                        .select("text")
                        .eq("business_id", rr.business_id)
                        .not("text", "is", null)
                        .order("review_date", { ascending: false })
                        .limit(5);

                    if (reviews && reviews.length > 0) {
                        recentReviewsContext = reviews
                            .map((r, i) => `Previous Review ${i + 1}: "${r.text}"`)
                            .join("\n\n");
                    }
                }
            } catch (err) {
                logger.error({ err: err }, "Failed to fetch context reviews:");
            }
        }

        if (!resolvedBusinessId && businessId) {
            resolvedBusinessId = businessId;
        }

        if (!resolvedBusinessId) {
            return NextResponse.json(
                { error: "AI review draft requires an eligible paid plan.", code: "AI_REVIEW_DRAFT_PLAN_REQUIRED" },
                { status: 403 }
            );
        }

        const supabase = createAdminClient();
        let reviewRequestAlreadyGenerated = false;
        let orgId: string | null = null;
        let maxAiDraftsPerMonth = 0;
        let planStatus: string | null = null;

        try {
            const { data: biz } = await supabase
                .from("businesses")
                .select("organization_id, organizations!inner(plan, plan_status, max_ai_replies_per_month)")
                .eq("id", resolvedBusinessId)
                .maybeSingle();
            const org = (biz as { organizations?: { plan?: string | null; plan_status?: string | null; max_ai_replies_per_month?: number | null }; organization_id?: string | null } | null)?.organizations ?? null;
            orgId = (biz as { organization_id?: string | null } | null)?.organization_id ?? null;
            maxAiDraftsPerMonth = typeof org?.max_ai_replies_per_month === "number" ? org.max_ai_replies_per_month : 0;
            planStatus = typeof org?.plan_status === "string" ? org.plan_status : null;

            if (!planAllowsAiReviewFeatures(org?.plan ?? null, org?.plan_status ?? null)) {
                return NextResponse.json(
                    { error: "AI review draft requires an active Starter, Professional, or Enterprise plan.", code: "AI_REVIEW_DRAFT_PLAN_REQUIRED" },
                    { status: 403 }
                );
            }

            if (reviewRequestId) {
                const { data: existingDraft } = await supabase
                    .from("review_requests")
                    .select("id")
                    .eq("id", reviewRequestId)
                    .not("ai_review_text", "is", null)
                    .maybeSingle();
                reviewRequestAlreadyGenerated = Boolean(existingDraft?.id);
            }

            if (orgId && maxAiDraftsPerMonth !== -1 && planStatus && ["active", "trialing"].includes(planStatus)) {
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                startOfMonth.setHours(0, 0, 0, 0);

                const { data: orgBusinesses } = await supabase
                    .from("businesses")
                    .select("id")
                    .eq("organization_id", orgId);

                const businessIds = (orgBusinesses ?? []).map((b: { id: string }) => b.id);
                if (businessIds.length > 0) {
                    const { count: usedDrafts } = await supabase
                        .from("review_requests")
                        .select("*", { count: "exact", head: true })
                        .in("business_id", businessIds)
                        .not("ai_review_text", "is", null)
                        .gte("created_at", startOfMonth.toISOString());

                    const currentUsed = usedDrafts ?? 0;
                    if (!reviewRequestAlreadyGenerated && currentUsed >= maxAiDraftsPerMonth) {
                        return NextResponse.json(
                            {
                                error: "Monthly AI review draft limit reached for your plan.",
                                code: "AI_REVIEW_DRAFT_LIMIT_REACHED",
                                limit: maxAiDraftsPerMonth,
                            },
                            { status: 429 }
                        );
                    }
                }
            }
        } catch {
            return NextResponse.json(
                { error: "AI review draft requires an eligible paid plan.", code: "AI_REVIEW_DRAFT_PLAN_REQUIRED" },
                { status: 403 }
            );
        }

        const prompt = `You are a customer writing a short, natural Google review. Write as if you are the customer. Every review must be optimized for SEO (Search Engine Optimization) and AEO (Answer Engine Optimization). Strictly NO icons, NO emojis, and NO 'AI-sounding' phrases.

Task: Write a Google review for ${businessName}, a ${businessCategory} business. ${tagContext}${staffString}

Context (Last 5 reviews for this business - DO NOT COPY):
${recentReviewsContext || "None available."}

Rules for a NATURAL, HUMAN-WRITTEN review:
- First person perspective as the customer
- Write exactly 2-3 complete sentences; every sentence must end with proper punctuation (period, etc.).
- The last sentence must clearly include the full business name: "${businessName}".
- Do not stop mid-sentence. Do not trail off with "to" or an unfinished clause.
- Strictly NO icons or emojis
- Strictly NO starting with 'I'
- Strictly NO 'highly recommend'
- SEO/AEO Optimization: Naturally include "${businessName}" or relevant keywords like "${businessCategory}" in the text.
- Answer Engine Friendly: Use clear, direct sentences for AI search engines to feature as snippets.
- Sound like a real person, not marketing. ONE exclamation mark max.
- Mention specific things the customer liked naturally.
- Output ONLY the review text — no labels, no quotes around the whole review, no "Review:" prefix.

Review Content:`;

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

            if (reviewRequestId) {
                await supabase
                    .from("review_requests")
                    .update({
                        ai_review_text: reviewText,
                        rating_given: rating,
                    })
                    .eq("id", reviewRequestId);
            }

            logger.info({ businessName }, "[AI SUCCESS] Generated review for review flow");
            return NextResponse.json({ reviewText });
        } catch (aiError) {
            logger.error({ err: aiError }, "AI generation failed for review flow:");

            logger.error(`[AI FALLBACK] AI failed. Using Smart Template for ${businessName}.`);
            const fallbackText = ensureCompleteReviewText(
                `Had a wonderful time at ${businessName}. The ${selectedTags.slice(0, 2).join(" and ").toLowerCase()} was fantastic. Highly recommend ${businessName}.`,
                businessName
            );

            if (reviewRequestId) {
                await supabase
                    .from("review_requests")
                    .update({
                        ai_review_text: fallbackText,
                        rating_given: rating,
                    })
                    .eq("id", reviewRequestId);
            }

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
