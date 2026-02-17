import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { z } from "zod"; // Fixed import from zod/v4 to zod

const requestSchema = z.object({
    businessName: z.string().min(1),
    businessCategory: z.string().min(1),
    rating: z.number().int().min(4).max(5),
    selectedTags: z.array(z.string()).min(1).max(10), // Increased max tags to be safe
});

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(request: Request) {
    try {
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
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `Write a Google review for a ${businessCategory} called ${businessName}. The customer gave ${rating} stars and especially liked: ${tagsString}.

Rules:
- Write in first person as the customer
- 2-3 sentences maximum
- Sound like a real person, not a marketing bot
- Mention the specific things they liked naturally
- Enthusiastic but genuine tone
- Maximum ONE exclamation mark in the entire review
- Do NOT start with 'I'
- Do NOT use phrases like 'I highly recommend' or 'I can't say enough'
- Vary your sentence structure`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const reviewText = response.text().trim();

            if (!reviewText) {
                throw new Error("Empty AI response");
            }

            return NextResponse.json({ reviewText });
        } catch (aiError) {
            console.error("AI generation failed, using fallback:", aiError);

            // Fallback template
            const firstTag = selectedTags[0] || "experience";
            const fallbackText = `Great experience at ${businessName}! Really loved the ${firstTag.toLowerCase()}. Would definitely come back.`;

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
