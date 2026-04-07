
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { z } from "zod";

const businessPatchSchema = z
    .object({
        name: z.string().min(1).max(255).optional(),
        category: z.string().min(1).max(100).optional(),
        timezone: z.string().min(1).max(80).optional(),
        country: z.string().min(2).max(2).optional(),
        phone: z.string().max(30).optional().nullable(),
        email: z.string().email().max(255).optional().nullable().or(z.literal("")),
        website: z.string().url().max(500).optional().nullable(),
        logo_url: z.string().url().max(1000).optional().nullable(),
        address: z.string().max(1000).optional().nullable(),
        address_line1: z.string().max(1000).optional().nullable(),
        city: z.string().max(120).optional().nullable(),
        state: z.string().max(120).optional().nullable(),
        postal_code: z.string().max(20).optional().nullable(),
        zip: z.string().max(20).optional().nullable(),
        brand_color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i).optional().nullable(),
    })
    .strict();

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { supabase, user } = await requireUser();
        const { id } = await params;
        const raw = await request.json();
        const parsed = businessPatchSchema.safeParse(raw);
        if (!parsed.success) {
            throw new ApiRouteError("Invalid business update payload", {
                status: 400,
                code: "INVALID_BUSINESS_UPDATE",
            });
        }
        const body = parsed.data;
        if (Object.keys(body).length === 0) {
            throw new ApiRouteError("No valid fields to update", {
                status: 400,
                code: "EMPTY_BUSINESS_UPDATE",
            });
        }

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

        // Invalidate Redis cache for this user
        try {
            const { redis } = await import("@/lib/db/redis");
            const cacheKey = `user_businesses:${user.id}`;
            await redis.del(cacheKey);
        } catch (e) {
            console.error("Failed to delete business cache:", e);
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

        // Invalidate Redis cache for this user
        try {
            const { redis } = await import("@/lib/db/redis");
            const cacheKey = `user_businesses:${user.id}`;
            await redis.del(cacheKey);
        } catch (e) {
            console.error("Failed to delete business cache:", e);
        }

        return apiOk({ success: true });
    } catch (err) {
        const e = toApiError(err);
        return apiError(e.message, { status: e.status, code: e.code, details: e.details });
    }
}
