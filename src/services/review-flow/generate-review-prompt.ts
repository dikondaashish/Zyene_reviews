/** Prompt construction and recent-review context for AI review drafts. */
import type { SupabaseClient } from "@supabase/supabase-js";

import { logger } from "@/lib/logger";
import type { Database } from "@/lib/db/supabase/database.types";

const RECENT_REVIEW_SAMPLE_SIZE = 5;

export interface ResolvedReviewContext {
    /** business_id resolved server-side from the review request — never trusted from the client. */
    resolvedBusinessId: string | null;
    recentReviewsContext: string;
}

/**
 * Resolves the owning business from a review request and pulls a few recent
 * reviews for tone context. Failures are non-fatal — the draft just loses
 * context.
 */
export async function loadRecentReviewsContext(
    supabase: SupabaseClient<Database>,
    reviewRequestId: string,
): Promise<ResolvedReviewContext> {
    try {
        const { data: rr, error: rrErr } = await supabase
            .from("review_requests")
            .select("business_id")
            .eq("id", reviewRequestId)
            .maybeSingle();

        if (rrErr || !rr?.business_id) {
            return { resolvedBusinessId: null, recentReviewsContext: "" };
        }

        const { data: reviews } = await supabase
            .from("reviews")
            .select("text")
            .eq("business_id", rr.business_id)
            .not("text", "is", null)
            .order("review_date", { ascending: false })
            .limit(RECENT_REVIEW_SAMPLE_SIZE);

        const recentReviewsContext =
            reviews && reviews.length > 0
                ? reviews.map((r, i) => `Previous Review ${i + 1}: "${r.text}"`).join("\n\n")
                : "";

        return { resolvedBusinessId: rr.business_id, recentReviewsContext };
    } catch (err) {
        logger.error({ err }, "Failed to fetch context reviews:");
        return { resolvedBusinessId: null, recentReviewsContext: "" };
    }
}

export function buildReviewPrompt(params: {
    businessName: string;
    businessCategory: string;
    tagContext: string;
    staffString: string;
    recentReviewsContext: string;
}): string {
    const { businessName, businessCategory, tagContext, staffString, recentReviewsContext } = params;

    return `You are a customer writing a short, natural Google review. Write as if you are the customer. Every review must be optimized for SEO (Search Engine Optimization) and AEO (Answer Engine Optimization). Strictly NO icons, NO emojis, and NO 'AI-sounding' phrases.

Task: Write a Google review for ${businessName}, a ${businessCategory} business. ${tagContext}${staffString}

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
}

/** Builds the staff-highlight clause appended to the task line. */
export function buildStaffClause(selectedStaff: string[] | undefined): string {
    if (!selectedStaff || selectedStaff.length === 0) return "";
    return ` They also specifically wanted to highlight the great service from their staff member(s): ${selectedStaff.join(" and ")}.`;
}
