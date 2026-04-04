import { anthropic } from "@/lib/ai/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { aiRateLimit } from "@/lib/auth/rate-limit";

const requestSchema = z.object({
    businessName: z.string().min(1),
    businessCategory: z.string().min(1),
    rating: z.number().int().min(4).max(5),
    selectedTags: z.array(z.string()).min(1).max(10),
});

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

        const { businessName, businessCategory, rating, selectedTags } = parsed.data;
        const tagsString = selectedTags.join(", ");

        try {
            const message = await anthropic.messages.create({
                model: "claude-opus-4-6",
                max_tokens: 256,
                system: "You write short, natural Google reviews on behalf of customers. Write as if you are the customer.",
                messages: [
                    {
                        role: "user",
                        content: `Write a Google review for ${businessName}, a ${businessCategory} business. The customer gave ${rating} stars and especially liked: ${tagsString}.

Rules:
- First person as the customer
- 2-3 sentences maximum
- Sound like a real person, not marketing
- Mention the specific things they liked naturally
- Warm and genuine tone
- Maximum ONE exclamation mark
- Do NOT start with 'I'
- Do NOT use 'highly recommend'
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
