import { Schema, Type as SchemaType } from "@google/genai";

export const replySchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        replies: {
            type: SchemaType.ARRAY,
            description: "An array of 3 distinct, professional replies.",
            items: { type: SchemaType.STRING }
        }
    },
    required: ["replies"]
};

export const singleReplySchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        reply: {
            type: SchemaType.STRING,
            description: "A single reply to the customer review in the requested tone.",
        },
    },
    required: ["reply"],
};

export const qaSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        answer: {
            type: SchemaType.STRING,
            description: "The helpful and concise answer to the customer's question."
        }
    },
    required: ["answer"]
};

export const batchSchema: Schema = {
    type: SchemaType.ARRAY,
    description: "An array of generated replies mapped one-to-one with the input reviews.",
    items: {
        type: SchemaType.OBJECT,
        properties: {
            reviewId: { type: SchemaType.STRING, description: "The original review identifier" },
            rating: { type: SchemaType.NUMBER },
            summary: { type: SchemaType.STRING, description: "One sentence summary" },
            sentiment: { type: SchemaType.STRING, description: "Positive, Neutral, or Negative" },
            suggested_reply: { type: SchemaType.STRING, description: "A highly personalized reply to the review" }
        },
        required: ["reviewId", "rating", "summary", "sentiment", "suggested_reply"]
    }
};
