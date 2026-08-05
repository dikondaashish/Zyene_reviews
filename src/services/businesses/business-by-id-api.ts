import { logger } from "@/lib/logger";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";

import { businessPatchSchema } from "./business-patch-schema";
import {
    assertAutoReplyAllowed,
    assertBusinessMembership,
    buildBusinessUpdatePayload,
    loadCurrentBusiness,
    resolveUniqueSlug,
} from "./business-patch-guards";

/** The business list is cached per user in Redis; drop it after any mutation. */
async function invalidateBusinessCache(userId: string): Promise<void> {
    try {
        const { redis } = await import("@/lib/db/redis");
        await redis.del(`user_businesses:${userId}`);
    } catch (e) {
        logger.error({ err: e }, "Failed to delete business cache:");
    }
}

export async function patchBusiness(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { supabase, user } = await requireUser();
        const { id } = await params;

        const parsed = businessPatchSchema.safeParse(await request.json());
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

        await assertBusinessMembership(supabase, user.id, id);
        const current = await loadCurrentBusiness(supabase, id);
        assertAutoReplyAllowed(body, current);

        const resolvedSlug =
            body.slug !== undefined ? await resolveUniqueSlug(supabase, id, body.slug) : undefined;

        const { data, error } = await supabase
            .from("businesses")
            .update(buildBusinessUpdatePayload(body, current, resolvedSlug))
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

        await invalidateBusinessCache(user.id);

        return apiOk(data);
    } catch (err) {
        const e = toApiError(err);
        return apiError(e.message, { status: e.status, code: e.code, details: e.details });
    }
}

export async function deleteBusiness(
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

        await invalidateBusinessCache(user.id);

        return apiOk({ success: true });
    } catch (err) {
        const e = toApiError(err);
        return apiError(e.message, { status: e.status, code: e.code, details: e.details });
    }
}
