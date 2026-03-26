
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { supabase, user } = await requireUser();
        const { id } = await params;
        const body = await request.json();

        // Verify ownership via organization_members
        const { data: membership, error: membError } = await supabase
            .from("organization_members")
            .select("role, organizations!inner(businesses!inner(id))")
            .eq("user_id", user.id)
            .eq("organizations.businesses.id", id)
            .single();

        if (membError || !membership) {
            throw new ApiRouteError("Forbidden", { status: 403, code: "FORBIDDEN" });
        }

        // Update business
        const { data, error } = await supabase
            .from("businesses")
            .update(body)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            throw new ApiRouteError("Internal Server Error", {
                status: 500,
                code: "BUSINESS_UPDATE_FAILED",
                details: error.message,
            });
        }

        return apiOk(data);
    } catch (err) {
        const e = toApiError(err);
        return apiError(e.message, { status: e.status, code: e.code, details: e.details });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { supabase, user } = await requireUser();
        const { id } = await params;

        // Verify user belongs to org that owns this business.
        const { data: membership, error: membError } = await supabase
            .from("organization_members")
            .select("organization_id, organizations!inner(businesses!inner(id))")
            .eq("user_id", user.id)
            .eq("organizations.businesses.id", id)
            .maybeSingle();

        if (membError || !membership?.organization_id) {
            throw new ApiRouteError("Forbidden", { status: 403, code: "FORBIDDEN" });
        }

        // Prevent deleting the last non-archived business in the org.
        const { count: activeCount, error: countErr } = await supabase
            .from("businesses")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", membership.organization_id)
            .neq("status", "archived");

        if (countErr) {
            throw new ApiRouteError("Failed to validate business count", {
                status: 500,
                code: "BUSINESS_COUNT_CHECK_FAILED",
                details: countErr.message,
            });
        }
        if ((activeCount ?? 0) <= 1) {
            throw new ApiRouteError("You must keep at least one active business.", {
                status: 400,
                code: "LAST_ACTIVE_BUSINESS",
            });
        }

        const { error: archiveErr } = await supabase
            .from("businesses")
            .update({ status: "archived", updated_at: new Date().toISOString() })
            .eq("id", id);

        if (archiveErr) {
            throw new ApiRouteError("Failed to delete business", {
                status: 500,
                code: "BUSINESS_ARCHIVE_FAILED",
                details: archiveErr.message,
            });
        }

        return apiOk({ success: true });
    } catch (err) {
        const e = toApiError(err);
        return apiError(e.message, { status: e.status, code: e.code, details: e.details });
    }
}
