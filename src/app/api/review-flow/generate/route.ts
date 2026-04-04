import { anthropic } from "@/lib/ai/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { aiRateLimit } from "@/lib/auth/rate-limit";

const requestSchema = z.object({
    businessId: z.string().optional(),
    businessName: z.string().min(1),
    businessCategory: z.string().min(1),
    rating: z.number().int().min(4).max(5),
    selectedTags: z.array(z.string()).min(1).max(10),
});
import { createAdminClient } from "@/lib/db/supabase/admin";

export async function POST(request: Request) {
    try {
        // Enforce Rate Limiting keyed by IP Address
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

        const { businessId, businessName, businessCategory, rating, selectedTags } = parsed.data;
        const tagsString = selectedTags.join(", ");

        // 1. Fetch Top 5 Recent Reviews Context
        let recentReviewsContext = "";
        if (businessId) {
            try {
                const supabase = createAdminClient();
                const { data: reviews } = await supabase
                    .from("reviews")
                    .select("text")
                    .eq("business_id", businessId)
                    .not("text", "is", null)
                    .order("review_date", { ascending: false })
                    .limit(5);

                if (reviews && reviews.length > 0) {
                    recentReviewsContext = reviews
                        .map((r, i) => `Previous Review ${i + 1}: "${r.text}"`)
                        .join("\n\n");
                }
            } catch (err) {
                console.error("Failed to fetch context reviews:", err);
            }
        }

        try {
            const message = await anthropic.messages.create({
                model: "claude-opus-4-6",
                max_tokens: 256,
                system: "You write short, natural Google reviews on behalf of customers. Write as if you are the customer. Every review must be optimized for SEO (Search Engine Optimization) and AEO (Answer Engine Optimization). Strictly NO icons, NO emojis, and NO 'AI-sounding' phrases.",
                messages: [
                    {
                        role: "user",
                        content: `Write a Google review for ${businessName}, a ${businessCategory} business. The customer gave ${rating} stars and especially liked: ${tagsString}.

Here are the last 5 reviews written for this specific business (DO NOT COPY ANY OF THE CONTENT, PHRASES, OR STYLES FROM THESE):
${recentReviewsContext || "None available."}

Rules for a NATURAL, HUMAN-WRITTEN review:
- First person as the customer
- 2-3 sentences maximum
- Strictly NO icons or emojis
- Strictly NO starting with 'I'
- Strictly NO 'highly recommend'
- SEO/AEO Optimization: Naturally include "${businessName}" or relevant keywords like "${businessCategory}" in the text.
- Answer Engine Friendly: Use clear, direct sentences that are easy for AI search engines to parse and feature as snippets.
- Sound like a real person, not marketing
- Mention the specific things they liked naturally
- Warm and genuine tone
- Maximum ONE exclamation mark
- Vary sentence structure`,
                    },
                ],
            });

            const textBlock = message.content.find((b) => b.type === "text");
            const reviewText = textBlock?.text?.trim();

            if (!reviewText) {
                throw new Error("Empty AI response");
            }

            return NextResponse.json({ reviewText });
        } catch (aiError) {
            console.error("AI generation failed for review flow:", aiError);

            // Log full error for Vertex AI debugging
            if (typeof aiError === 'object' && aiError !== null) {
                console.error("Vertex AI Error Details:", JSON.stringify(aiError, null, 2));
            }

            // Enhanced fallback that mentions the tags
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
