import { type NextRequest } from "next/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { z } from "zod";

const bulkUpdateSchema = z.object({
    ids: z.array(z.string().uuid()).min(1).max(500),
    businessId: z.string().uuid(),
    status: z.enum(["pending", "responded", "ignored"]),
});

export async function POST(request: NextRequest) {
    try {
        const { supabase, user } = await requireUser();

        const parsed = bulkUpdateSchema.safeParse(await request.json());
        if (!parsed.success) {
            throw new ApiRouteError("Missing required fields", {
                status: 400,
                code: "INVALID_PAYLOAD",
            });
        }

        const { ids, businessId, status } = parsed.data;

        // 1. Verify Access
        const hasAccess = await userCanAccessBusiness(supabase, user.id, businessId);
        if (!hasAccess) {
            throw new ApiRouteError("Access denied", { status: 403, code: "FORBIDDEN" });
        }

        // 2. Perform Bulk Update
        const { count, error: updateError } = await supabase
            .from("reviews")
            .update({ response_status: status })
            .in("id", ids)
            .eq("business_id", businessId);

        if (updateError) {
            throw new ApiRouteError("Bulk update failed", {
                status: 500,
                code: "BULK_REVIEW_UPDATE_FAILED",
                details: updateError.message,
            });
        }

        return apiOk({ success: true, count });
    } catch (error: unknown) {
        console.error("Bulk Review Update Error:", error);
        const normalized = toApiError(error);
        return apiError(normalized.message, {
            status: normalized.status,
            code: normalized.code,
            details: normalized.details,
        });
    }
}
