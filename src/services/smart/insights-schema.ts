import { Schema, Type as SchemaType } from "@google/genai";

export const insightsSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        headline: {
            type: SchemaType.STRING,
            description: "A catchy two-part headline summarizing the overall sentiment. e.g., 'Guests love your brisket. The beans, not so much.'",
        },
        themes: {
            type: SchemaType.ARRAY,
            description: "3 to 5 key themes extracted from all the reviews.",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    name: { type: SchemaType.STRING, description: "Short 2-3 word theme name" },
                    mentions: { type: SchemaType.NUMBER, description: "Actally how many reviews from the provided list mention this theme. Must be <= total reviews." },
                    sentiment: { type: SchemaType.STRING, description: "positive, negative, or neutral" },
                    summaryQuote: { type: SchemaType.STRING, description: "A one sentence summary of what guests say" },
                    customerQuotes: {
                        type: SchemaType.ARRAY,
                        items: { type: SchemaType.STRING },
                        description: "2 real customer quotes supporting this theme",
                    },
                },
                required: ["name", "mentions", "sentiment", "summaryQuote", "customerQuotes"],
            },
        },
        suggestions: {
            type: SchemaType.ARRAY,
            description: "2 to 3 actionable suggestions for the business owner",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    title: { type: SchemaType.STRING, description: "Short actionable title" },
                    urgency: { type: SchemaType.STRING, description: "'Act now' or 'When you can'" },
                    effort: { type: SchemaType.STRING, description: "'Low', 'Medium', or 'High'" },
                    impact: { type: SchemaType.STRING, description: "e.g., '+0.2 avg stars' or '+8% impressions'" },
                    description: { type: SchemaType.STRING, description: "Detailed 1-2 sentence description" },
                },
                required: ["title", "urgency", "effort", "impact", "description"],
            },
        },
    },
    required: ["headline", "themes", "suggestions"],
};

export const INSIGHTS_PROMPT = `You are an expert business analyst. Analyze the following customer reviews for a business called "{business_name}".

Extract:
1. **Headline**: Write a catchy two-part headline summarizing the main positive and main negative (or neutral). Separate them with a period.
2. **Key Themes** (3-5): The most prominent recurring themes. Give them short names, count exactly how many reviews mention this theme (must be a realistic number relative to the {count} total reviews provided), assign sentiment, write a summary quote, and include exactly two direct quotes from the provided list.
3. **Suggestions** (2-3): Actionable, specific suggestions the business owner can implement to improve. Include an urgency tag, an effort tag, an impact tag, and a detailed description.

Rules:
- Be highly specific. Reference actual patterns from the data (e.g., specific menu items, staff, common complaints).
- Do NOT use generic filler like "improve customer service".
- Write the summary quote in third person.

Reviews ({count} total):
{reviews}`;
