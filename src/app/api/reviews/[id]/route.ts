import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { type NextRequest } from "next/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { apiOk, apiError } from "@/app/api/_shared/responses";
import { z } from "zod";

const updateStatusSchema = z.object({
    status: z.enum(["pending", "responded", "ignored"]),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return apiError("Unauthorized", { status: 401 });
        }

        const parsed = updateStatusSchema.safeParse(await request.json());
        if (!parsed.success) {
            return apiError("Invalid status", { status: 400 });
        }
        const { status } = parsed.data;

        // 1. Fetch Review to get Business ID
        const { data: review, error: fetchError } = await supabase
            .from("reviews")
            .select("business_id")
            .eq("id", id)
            .single();

        if (fetchError || !review) {
            return apiError("Review not found", { status: 404 });
        }

        // 2. Verify Access
        const hasAccess = await userCanAccessBusiness(supabase, user.id, review.business_id);
        if (!hasAccess) {
            return apiError("Access denied", { status: 403 });
        }

        // 3. Update Status
        const { data, error: updateError } = await supabase
            .from("reviews")
            .update({ response_status: status })
            .eq("id", id)
            .select()
            .single();

        if (updateError) throw updateError;

        return apiOk(data);
    } catch (error: unknown) {
        logger.error({ err: error }, "Review PATCH Error:");
        const message = error instanceof Error ? error.message : "An unexpected error occurred";
        return apiError(message, { status: 500 });
    }
}
