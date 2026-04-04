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
- Be genuine, not corporate or robotic. Avoid "owner-isms" or starting every sentence with "I".
- **Strict Human-Realism**: NO emojis, NO icons, and NO overly excited marketing language like "highly recommend!". It must look like a real person typed it.
- Reference specific things the customer mentioned
- SEO/AEO Optimization: Naturally include {business_name}, {business_category}, and relevant keywords based on the customer's comments.
- Answer Engine friendly: Use clear, structured sentences that are easy for AI search engines to parse.
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
- **Strict Human-Realism**: NO emojis, NO icons, and NO "I" at the start of every sentence. Natural, authoritative, and direct.
- SEO/AEO Friendly: Provide a direct, authoritative answer that search engines can easily feature as a snippet. Mention {business_name} if relevant.
- Do not invent policies or guarantees.
Return ONLY valid JSON:
{ "answer": "..." }`;
export const BATCH_REVIEWS_PROMPT = `Analyze these 5 customer reviews for a business. 
Return ONLY a valid JSON array of 5 objects, in the same order as the reviews provided. 
No markdown, no preamble.

Each object MUST follow this schema:
{
  "reviewId": "the original review identifier provided",
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "urgency": (number 1-10, where 10 is most urgent),
  "themes": (array of: "food_quality", "service_speed", "staff_behavior", "cleanliness", "pricing", "ambiance", "delivery", "wait_time", "portion_size", "parking", "noise", "product_quality", "professionalism", "communication", "value", "other"),
  "summary": "One sentence summary"
}

Reviews to analyze:
{reviews_json}`;
