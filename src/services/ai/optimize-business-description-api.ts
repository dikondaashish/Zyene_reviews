import { z } from "zod";
import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { aiRateLimit } from "@/lib/auth/rate-limit";
import { generateContentWithFallback, nextResponseForVertexAiError } from "@/domains/ai/adapters/VertexAdapter";
import { createRequestLogger } from "@/lib/logger";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { planAllowsAiReviewFeatures } from "@/services/stripe/plans";

const requestSchema = z.object({
    businessId: z.string().uuid(),
    currentDescription: z.string().max(5000).optional().default(""),
    topKeywords: z.array(z.string()).max(30).optional().default([]),
});

function normalizeDescription(input: string): string {
    return input
        .trim()
        .replace(/^["'`]+|["'`]+$/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .slice(0, 740);
}

export async function handleOptimizeBusinessDescription(request: Request) {
    const { logger, requestId } = createRequestLogger("POST /api/ai/optimize-business-description");
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiError("Unauthorized", { status: 401, details: requestId });

    const { success: rateOk } = await aiRateLimit.limit(user.id);
    if (!rateOk) {
        return apiError("AI rate limit exceeded. Please wait a minute.", { status: 429, details: requestId });
    }

    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
        return apiError("Invalid request payload", { status: 400, details: requestId });
    }

    const { businessId, currentDescription, topKeywords } = parsed.data;
    const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
    if (!allowed) return apiError("Forbidden", { status: 403, details: requestId });

    const { data: business, error: businessErr } = await supabase
        .from("businesses")
        .select("id, name, city, state, country, organization_id")
        .eq("id", businessId)
        .single();
    if (businessErr || !business?.organization_id) {
        return apiError("Business not found", { status: 404, details: requestId });
    }

    const { data: org, error: orgErr } = await supabase
        .from("organizations")
        .select("plan, plan_status")
        .eq("id", business.organization_id)
        .single();
    if (orgErr || !org) {
        return apiError("Organization not found", { status: 404, details: requestId });
    }

    if (!planAllowsAiReviewFeatures(org.plan, org.plan_status ?? null)) {
        return apiError("AI optimization requires an active Starter, Professional, or Enterprise plan.", {
            status: 403,
            code: "AI_DESCRIPTION_PLAN_REQUIRED",
            details: requestId,
        });
    }

    const keywordList = topKeywords
        .map((k) => k.trim())
        .filter(Boolean)
        .slice(0, 12)
        .join(", ");

    const businessName = (business.name || "This business").trim();
    const location = [business.city, business.state, business.country].filter(Boolean).join(", ");
    const existing = currentDescription.trim();

    const prompt = `You are a local SEO and AEO copywriter.
Rewrite the Google Business Profile description for this business.

Business name: ${businessName}
Location: ${location || "Not provided"}
Priority keywords: ${keywordList || "None provided"}
Current description:
${existing || "(No current description provided)"}

Requirements:
- Output one polished business description only (no bullets, no intro labels).
- Keep it 120 to 220 words.
- Sound natural and human, no hype spam and no keyword stuffing.
- Include relevant local and service intent naturally.
- Do not include fake claims, guarantees, or unverifiable superlatives.
- Do not use emojis.
- Keep it suitable for Google Business Profile.
`;

    try {
        const raw = await generateContentWithFallback(prompt, {
            maxOutputTokens: 340,
            temperature: 0.55,
        });
        const optimizedDescription = normalizeDescription(raw || "");
        if (!optimizedDescription) {
            return apiError("AI returned an empty description. Please try again.", {
                status: 502,
                details: requestId,
            });
        }

        logger.info({ userId: user.id, businessId }, "AI business description optimized");
        return apiOk({ optimizedDescription, requestId });
    } catch (error) {
        return nextResponseForVertexAiError(error, "Failed to optimize description.");
    }
}
