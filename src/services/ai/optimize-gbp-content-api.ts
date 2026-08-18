import { z } from "zod";

import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { aiRateLimit } from "@/lib/auth/rate-limit";
import { nextResponseForVertexAiError } from "@/domains/ai/adapters/vertex-adapter";
import { createRequestLogger } from "@/lib/logger";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { planAllowsAiReviewFeatures } from "@/services/stripe/plans";
import { getValidGoogleToken } from "@/services/google/sync-service";
import { getGoogleLocation } from "@/services/google/listing-information";
import { generatePostDrafts, generateServiceDescriptions } from "./gbp-content-generators";

/**
 * F6.6 — the services and posts arms of the GBP optimizer.
 *
 * Q&A is deliberately not here: answering a real customer question already
 * ships as /api/ai/suggest-qa-answer over the synced `gbp_questions` rows, and
 * a second implementation would drift from it.
 *
 * Both surfaces are grounded in what Google actually returns for the listing —
 * real `serviceItems`, real recent posts — so the model is rephrasing the
 * merchant's own data rather than inventing a business.
 */

const requestSchema = z.object({
    businessId: z.string().uuid(),
    surface: z.enum(["services", "posts"]),
    topKeywords: z.array(z.string()).max(30).optional().default([]),
});

export async function handleOptimizeGbpContent(request: Request) {
    const { logger, requestId } = createRequestLogger("POST /api/ai/optimize-gbp-content");
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
    if (!parsed.success) return apiError("Invalid request payload", { status: 400, details: requestId });

    const { businessId, surface } = parsed.data;
    if (!(await userCanAccessBusiness(supabase, user.id, businessId))) {
        return apiError("Forbidden", { status: 403, details: requestId });
    }

    const { data: business } = await supabase
        .from("businesses")
        .select("id, name, city, organization_id")
        .eq("id", businessId)
        .single();
    if (!business?.organization_id) return apiError("Business not found", { status: 404, details: requestId });

    const { data: org } = await supabase
        .from("organizations")
        .select("plan, plan_status")
        .eq("id", business.organization_id)
        .single();
    if (!org) return apiError("Organization not found", { status: 404, details: requestId });

    if (!planAllowsAiReviewFeatures(org.plan, org.plan_status ?? null)) {
        return apiError("AI optimization requires an active Starter, Professional, or Enterprise plan.", {
            status: 403,
            code: "AI_GBP_CONTENT_PLAN_REQUIRED",
            details: requestId,
        });
    }

    const { data: platform } = await supabase
        .from("review_platforms")
        .select("id, google_account_id, google_location_id")
        .eq("business_id", businessId)
        .eq("platform", "google")
        .maybeSingle();

    if (!platform?.id || !platform.google_location_id) {
        return apiError("Connect Google Business Profile first.", { status: 404, details: requestId });
    }

    try {
        const { accessToken } = await getValidGoogleToken(platform.id);
        if (!accessToken) return apiError("Google token unavailable", { status: 401, details: requestId });

        const location = await getGoogleLocation(accessToken, platform.google_location_id);
        const category = location.categories?.primaryCategory?.displayName;
        if (!category) {
            return apiError("Your Google Business Profile has no primary category, so there is nothing to base copy on.", {
                status: 422,
                details: requestId,
            });
        }

        const context = {
            businessName: (business.name || "This business").trim(),
            category,
            city: location.storefrontAddress?.locality ?? business.city ?? null,
        };

        const result =
            surface === "services"
                ? await generateServiceDescriptions(location.serviceItems ?? [], context)
                : await generatePostDrafts(
                      { accessToken, accountId: platform.google_account_id, locationId: platform.google_location_id },
                      context,
                      parsed.data.topKeywords
                  );

        if ("error" in result) return apiError(result.error, { status: 422, details: requestId });

        logger.info({ userId: user.id, businessId, surface }, "GBP content optimized");
        return apiOk({ ...result, requestId });
    } catch (error) {
        return nextResponseForVertexAiError(error, "Failed to generate GBP content.");
    }
}
