
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { planAllowsAutoCommenter } from "@/services/stripe/plans";
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
        rating_style: z.enum(["emoji", "stars", "number", "slider", "radio"]).optional().nullable(),
        enable_staff_selection: z.boolean().optional(),
        staff_names: z.array(z.string().max(120)).max(100).optional(),
        /** Review flow copy & settings (public profile) */
        welcome_message: z.string().max(500).optional().nullable(),
        rating_subtitle: z.string().max(500).optional().nullable(),
        tags_heading: z.string().max(500).optional().nullable(),
        tags_subheading: z.string().max(500).optional().nullable(),
        custom_tags: z.array(z.string().max(80)).max(80).optional().nullable(),
        google_heading: z.string().max(500).optional().nullable(),
        google_subheading: z.string().max(500).optional().nullable(),
        google_button_text: z.string().max(200).optional().nullable(),
        google_review_url: z.string().max(2048).optional().nullable(),
        min_stars_for_google: z.number().int().min(1).max(5).optional().nullable(),
        apology_message: z.string().max(500).optional().nullable(),
        negative_subheading: z.string().max(500).optional().nullable(),
        negative_textarea_placeholder: z.string().max(500).optional().nullable(),
        negative_button_text: z.string().max(200).optional().nullable(),
        private_feedback_email_mode: z.enum(["hidden", "optional", "required"]).optional(),
        private_feedback_phone_mode: z.enum(["hidden", "optional", "required"]).optional(),
        thank_you_heading: z.string().max(200).optional().nullable(),
        thank_you_message: z.string().max(5000).optional().nullable(),
        footer_text: z.string().max(200).optional().nullable(),
        footer_company_name: z.string().max(200).optional().nullable(),
        footer_link: z.string().max(2048).optional().nullable(),
        footer_logo_url: z.string().max(1000).optional().nullable(),
        hide_branding: z.boolean().optional().nullable(),
        auto_reply_enabled: z.boolean().optional(),
        auto_reply_min_rating: z.union([z.literal(3), z.literal(4), z.literal(5)]).optional(),
        auto_reply_tone: z.enum(["professional", "friendly", "concise"]).optional(),
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

        const { data: currentBiz, error: curErr } = await supabase
            .from("businesses")
            .select(`
                auto_reply_enabled,
                organizations ( plan )
            `)
            .eq("id", id)
            .single();

        if (curErr || !currentBiz) {
            throw new ApiRouteError("Business not found", {
                status: 404,
                code: "BUSINESS_NOT_FOUND",
                details: curErr?.message,
            });
        }

        const orgPlan =
            (currentBiz.organizations as { plan?: string | null } | null)?.plan ?? null;
        const nextAutoReplyEnabled =
            body.auto_reply_enabled !== undefined
                ? body.auto_reply_enabled
                : currentBiz.auto_reply_enabled;
        const touchesAutoReply =
            body.auto_reply_enabled !== undefined ||
            body.auto_reply_min_rating !== undefined ||
            body.auto_reply_tone !== undefined;

        if (touchesAutoReply && nextAutoReplyEnabled && !planAllowsAutoCommenter(orgPlan)) {
            throw new ApiRouteError(
                "Auto commenter requires a Starter, Professional, or Enterprise plan.",
                {
                    status: 403,
                    code: "AUTO_REPLY_PLAN_REQUIRED",
                }
            );
        }

        const patch: typeof body & { auto_reply_enabled_at?: string | null } = { ...body };
        if (body.auto_reply_enabled === true && !currentBiz.auto_reply_enabled) {
            patch.auto_reply_enabled_at = new Date().toISOString();
        }
        if (body.auto_reply_enabled === false) {
            patch.auto_reply_enabled_at = null;
        }

        // Update business
        const { data, error } = await supabase
            .from("businesses")
            .update(patch)
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
