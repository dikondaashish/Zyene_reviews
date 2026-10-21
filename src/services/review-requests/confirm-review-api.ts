import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { terminateReviewRequestDrip } from "@/lib/campaigns/terminate-drip";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";

/**
 * Manual "review confirmed" for a request. Google, Yelp and Facebook give us only a public
 * display name for reviewers (no email/phone), so we cannot reliably match a published review
 * to a customer automatically. A team member who has seen the review can confirm it here;
 * it is stored as source "manual" and shown differently from automatic facts.
 */
const bodySchema = z.object({ confirmed: z.boolean() });

export async function handleConfirmReview(request: Request, requestId: string) {
    try {
        if (!z.uuid().safeParse(requestId).success) throw new ApiRouteError("Invalid request", { status: 400 });
        const parsed = bodySchema.safeParse(await request.json());
        if (!parsed.success) throw new ApiRouteError("Invalid payload", { status: 400 });
        const { supabase, user } = await requireUser();

        // Untyped until database.types.ts is regenerated with the review confirmation columns.
        const admin: SupabaseClient = createAdminClient();
        const { data: row, error } = await admin.from("review_requests")
            .select("id, business_id, review_confirmed_at, review_confirmation_source")
            .eq("id", requestId).maybeSingle();
        if (error) throw error;
        // Same response for "missing" and "other tenant" so ids cannot be probed.
        if (!row || !(await userCanAccessBusiness(supabase, user.id, row.business_id, true))) {
            throw new ApiRouteError("Review request not found", { status: 404 });
        }

        if (parsed.data.confirmed) {
            const { error: updateError } = await admin.from("review_requests").update({
                review_confirmed_at: new Date().toISOString(), review_confirmation_source: "manual",
                review_confirmed_by: user.id, review_left: true,
            }).eq("id", row.id).eq("business_id", row.business_id);
            if (updateError) throw updateError;
            await terminateReviewRequestDrip(admin, row.id, "review_left");
        } else if (row.review_confirmation_source === "manual") {
            const { error: updateError } = await admin.from("review_requests").update({
                review_confirmed_at: null, review_confirmation_source: null, review_confirmed_by: null, review_left: false,
            }).eq("id", row.id).eq("business_id", row.business_id);
            if (updateError) throw updateError;
        }
        return apiOk({ id: row.id, confirmed: parsed.data.confirmed });
    } catch (error) {
        if (!(error instanceof ApiRouteError)) logger.error({ err: error, requestId }, "[confirm-review] failed");
        const apiErr = toApiError(error);
        const message = apiErr.status >= 500 ? "Could not update the review confirmation" : apiErr.message;
        return apiError(message, { status: apiErr.status, code: apiErr.code });
    }
}
