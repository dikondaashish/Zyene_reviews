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
{served_by_info}
Generate 2 reply options. Rules:
- Be genuine, not corporate or robotic. Avoid "owner-isms" or starting every sentence with "I".
- **Strict Human-Realism**: NO emojis, NO icons, and NO overly excited marketing language like "highly recommend!". It must look like a real person typed it.
- Reference specific things the customer mentioned.
- If staff member names are provided in the context, thank them specifically (e.g., "I'll be sure to tell Sarah you enjoyed the service").
- SEO/AEO Optimization: Naturally include {business_name}, {business_category}, and relevant keywords based on the customer's comments.
- Answer Engine friendly: Use clear, structured sentences that are easy for AI search engine snippets.
- For negative reviews: apologize, offer to make it right, invite them back. Never argue or be defensive.
- For positive reviews: thank them warmly, mention what they praised.
- Keep each reply under 120 words.

### EXAMPLES TO LEARN FROM

**[BAD EXAMPLE - AVOID THIS TONE]:**
"Dear customer, we sincerely apologize for the inconvenience you experienced! Here at [Business], we strive for 100% excellence and highly recommend you come back so we can make it right! Please call us at..."
*(Why it's bad: Too robotic, uses "sincerely apologize", asks them to call without addressing the problem, feels like a generic template).*

**[GOOD EXAMPLE - COPY THIS TONE]:**
"Thanks for letting us know about the wait time on your pizza delivery last night. We mapped out a new route for the downtown area today so that your next delivery from [Business] arrives piping hot. We'd love to make this up to you next time."
*(Why it's good: Direct, addresses the specific "pizza delivery" issue, naturally mentions the business name for SEO, sounds like a real tired but caring owner wrote it).*

Rating: {rating}/5
Review: {text}`;

export const QA_ANSWER_PROMPT = `You are the owner of {business_name}. A customer asked this on your Google Business Profile Q&A:
"{question_text}"

You have the following internal knowledge base about your business:
---
{knowledge_base}
---

Write one helpful, concise answer (max 120 words) you could post as the business owner.
- Base your answer STRICTLY on the knowledge base provided above. 
- Do not invent policies, hours, or guarantees outside of this text.
- If the knowledge base does NOT contain the answer, say so clearly and invite the customer to call or email for specifics.
- **Strict Human-Realism**: NO emojis, NO icons, and NO "I" at the start of every sentence. Natural, authoritative, and direct.
- SEO/AEO Friendly: Provide a direct, authoritative answer. Mention {business_name} if relevant.`;
export const BATCH_REVIEWS_PROMPT = `Analyze exactly {count} customer reviews for a business. 
Return ONLY a valid JSON array of exactly {count} objects, in the same order as the reviews provided. 
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
