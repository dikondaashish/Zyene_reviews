import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { z } from "zod";

const statusSchema = z.object({
    status: z.enum(["open", "contacted", "resolved"]),
});

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idParsed = z.string().uuid().safeParse(id);
        if (!idParsed.success) {
            return apiError("Invalid feedback id", { status: 400 });
        }

        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return apiError("Unauthorized", { status: 401 });
        }

        const parsed = statusSchema.safeParse(await request.json());
        if (!parsed.success) {
            return apiError("Invalid status", { status: 400 });
        }
        const { status } = parsed.data;

        const { data: row, error: fetchError } = await supabase
            .from("private_feedback")
            .select("id, business_id")
            .eq("id", idParsed.data)
            .maybeSingle();

        if (fetchError || !row) {
            return apiError("Feedback not found", { status: 404 });
        }

        const hasAccess = await userCanAccessBusiness(supabase, user.id, row.business_id);
        if (!hasAccess) {
            return apiError("Access denied", { status: 403 });
        }

        const { data, error: updateError } = await supabase
            .from("private_feedback")
            .update({ status })
            .eq("id", idParsed.data)
            .select()
            .single();

        if (updateError) {
            console.error("Failed to update private feedback status:", updateError);
            return apiError("Failed to update status", { status: 500 });
        }

        return apiOk(data);
    } catch (error) {
        console.error("Status Update API Error:", error);
        return apiError("Internal server error", { status: 500 });
    }
}
