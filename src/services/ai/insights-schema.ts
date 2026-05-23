import { Schema, Type as SchemaType } from "@google/genai";

export const insightsSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        themes: {
            type: SchemaType.ARRAY,
            description: "3 to 5 key themes extracted from all the reviews",
            items: { type: SchemaType.STRING },
        },
        suggestions: {
            type: SchemaType.ARRAY,
            description: "2 to 3 actionable suggestions for the business owner",
            items: { type: SchemaType.STRING },
        },
    },
    required: ["themes", "suggestions"],
};

export const AI_INSIGHTS_PROMPT = `You are an expert business analyst. Analyze the following customer reviews for a business called "{business_name}".

Extract:
1. **Key Themes** (3-5): The most prominent recurring themes across all reviews. Each theme should be a single sentence describing what customers frequently mention — both positive and negative patterns.
2. **Suggestions** (2-3): Actionable, specific suggestions the business owner can implement to improve their ratings or capitalize on strengths.

Rules:
- Be specific. Reference actual patterns you see (e.g., specific menu items, staff names, common complaints).
- Do NOT use generic filler like "improve customer service". Be concrete.
- Write in third person (e.g., "Customers frequently praise..." not "Your customers...").
- Keep each theme and suggestion to one clear sentence.

Reviews ({count} total):
{reviews}`;
