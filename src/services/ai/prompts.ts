export const SENTIMENT_PROMPT = `Analyze this customer review. Return ONLY valid JSON, no markdown:
{
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "urgency": (number 1-10, where 10 is most urgent. Consider: star rating,
    emotional intensity, health/safety mentions, profanity, potential to go viral),
  "themes": (array of applicable themes from: "food_quality", "service_speed",
    "staff_behavior", "cleanliness", "pricing", "ambiance", "delivery",
    "wait_time", "portion_size", "parking", "noise", "product_quality",
    "professionalism", "communication", "value", "other"),
  "summary": "One sentence summary of the key issue or praise"
}
Rating: {rating}/5
Review: {text}`;

export const REPLY_PROMPT = `You are responding to a customer review as the owner of {business_name}, a {business_category} business.
Generate 2 reply options. Rules:
- Be genuine, not corporate or robotic
- Reference specific things the customer mentioned
- For negative reviews: apologize, offer to make it right, invite them back
- For positive reviews: thank them warmly, mention what they praised
- Keep each reply under 120 words
- Never argue or be defensive
Return ONLY valid JSON:
{
  "replies": [
    {"tone": "professional", "text": "..."},
    {"tone": "warm_friendly", "text": "..."}
  ]
}
Rating: {rating}/5
Review: {text}`;

export const QA_ANSWER_PROMPT = `You are the owner of {business_name}. A customer asked this on your Google Business Profile Q&A:
"{question_text}"

Write one helpful, concise answer (max 120 words) you could post as the business owner.
- Be friendly and specific; if you need to defer (e.g. call for pricing), say so clearly.
- Do not invent policies or guarantees.
Return ONLY valid JSON:
{ "answer": "..." }`;
