import { generateContentWithFallback } from "@/domains/ai/adapters/VertexAdapter";
import { NextResponse } from "next/server";
import { z } from "zod";
import { aiRateLimit } from "@/lib/auth/rate-limit";
import { createAdminClient } from "@/lib/db/supabase/admin";

const requestSchema = z.object({
    /** When set, last reviews are loaded only for this request's business (server-resolved). Never trust client businessId for DB reads. */
    reviewRequestId: z.string().uuid().optional(),
    businessName: z.string().min(1).max(200),
    businessCategory: z.string().min(1).max(120),
    rating: z.number().int().min(4).max(5),
    selectedTags: z.array(z.string().min(1).max(200)).min(1).max(10),
    selectedStaff: z.array(z.string().max(120)).max(50).optional(),
});

export async function POST(request: Request) {
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
            console.error("AI Rate limit check failed:", e);
        }

        const body = await request.json();
        const parsed = requestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request", details: parsed.error.issues },
                { status: 400 }
            );
        }

        const { reviewRequestId, businessName, businessCategory, rating, selectedTags, selectedStaff } =
            parsed.data;
        const tagsString = selectedTags.join(", ");
        const staffString =
            selectedStaff && selectedStaff.length > 0
                ? ` They also specifically wanted to highlight the great service from their staff member(s): ${selectedStaff.join(" and ")}.`
                : "";

        let recentReviewsContext = "";
        if (reviewRequestId) {
            try {
                const supabase = createAdminClient();
                const { data: rr, error: rrErr } = await supabase
                    .from("review_requests")
                    .select("business_id")
                    .eq("id", reviewRequestId)
                    .maybeSingle();

                if (!rrErr && rr?.business_id) {
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
                console.error("Failed to fetch context reviews:", err);
            }
        }

        const prompt = `You are a customer writing a short, natural Google review. Write as if you are the customer. Every review must be optimized for SEO (Search Engine Optimization) and AEO (Answer Engine Optimization). Strictly NO icons, NO emojis, and NO 'AI-sounding' phrases.

Task: Write a Google review for ${businessName}, a ${businessCategory} business. The customer gave ${rating} stars and especially liked: ${tagsString}.${staffString}

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
            // Short reviews still need headroom: low caps hit MAX_TOKENS mid-sentence (especially with staff + context).
            const reviewText = await generateContentWithFallback(prompt, {
                requireJson: false,
                maxOutputTokens: 1024,
                temperature: 0.7,
            });

            if (!reviewText || reviewText.trim().length < 10) {
                throw new Error("Empty AI response");
            }

            console.info(`[AI SUCCESS] Generated review for ${businessName} using Gemini 3 Flash`);
            return NextResponse.json({ reviewText: reviewText.trim() });
        } catch (aiError) {
            console.error("AI generation failed for review flow:", aiError);

            console.warn(`[AI FALLBACK] AI failed. Using Smart Template for ${businessName}.`);
            const fallbackText = `Had a wonderful time at ${businessName}. The ${selectedTags.slice(0, 2).join(" and ").toLowerCase()} was fantastic. Hope to see you again soon!`;

            return NextResponse.json({ reviewText: fallbackText });
        }
    } catch (error) {
        console.error("Review generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate review" },
            { status: 500 }
        );
    }
}
