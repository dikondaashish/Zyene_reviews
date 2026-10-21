import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";

/** Saved reply templates. Placeholders: {reviewer_name} (first name only), {business_name}. */
const templateSchema = z.object({
    name: z.string().trim().min(1).max(80),
    body: z.string().trim().min(3).max(4096),
});
const createSchema = templateSchema.extend({ businessId: z.uuid() });

function fail(error: unknown, fallback: string) {
    if (!(error instanceof ApiRouteError)) logger.error({ err: error }, `[reply-templates] ${fallback}`);
    const e = toApiError(error);
    return apiError(e.status >= 500 ? fallback : e.message, { status: e.status, code: e.code });
}

async function authorize(businessId: string) {
    const { supabase, user } = await requireUser();
    if (!(await canManageBusinessIntegration(supabase, user.id, businessId))) {
        throw new ApiRouteError("Only owners, admins and managers can edit reply templates", { status: 403 });
    }
}

export async function handleCreateReplyTemplate(request: Request) {
    try {
        const parsed = createSchema.safeParse(await request.json());
        if (!parsed.success) throw new ApiRouteError("Template needs a name and a reply of at least 3 characters", { status: 400 });
        await authorize(parsed.data.businessId);
        const admin: SupabaseClient = createAdminClient();
        const { data, error } = await admin.from("review_reply_templates")
            .insert({ business_id: parsed.data.businessId, name: parsed.data.name, body: parsed.data.body })
            .select("id, name, body").single();
        if (error) throw error;
        return apiOk(data, { status: 201 });
    } catch (error) {
        return fail(error, "Could not save template");
    }
}

async function loadTemplateBusiness(admin: SupabaseClient, id: string) {
    if (!z.uuid().safeParse(id).success) throw new ApiRouteError("Template not found", { status: 404 });
    const { data } = await admin.from("review_reply_templates").select("id, business_id").eq("id", id).maybeSingle();
    if (!data) throw new ApiRouteError("Template not found", { status: 404 });
    return data.business_id as string;
}

export async function handleUpdateReplyTemplate(request: Request, id: string) {
    try {
        const parsed = templateSchema.safeParse(await request.json());
        if (!parsed.success) throw new ApiRouteError("Template needs a name and a reply of at least 3 characters", { status: 400 });
        const admin: SupabaseClient = createAdminClient();
        const businessId = await loadTemplateBusiness(admin, id);
        await authorize(businessId);
        const { data, error } = await admin.from("review_reply_templates")
            .update({ ...parsed.data, updated_at: new Date().toISOString() })
            .eq("id", id).eq("business_id", businessId).select("id, name, body").single();
        if (error) throw error;
        return apiOk(data);
    } catch (error) {
        return fail(error, "Could not update template");
    }
}

export async function handleDeleteReplyTemplate(id: string) {
    try {
        const admin: SupabaseClient = createAdminClient();
        const businessId = await loadTemplateBusiness(admin, id);
        await authorize(businessId);
        // Rules using it fall back to "approval" (FK sets template_id to NULL).
        await admin.from("review_reply_rules").update({ action: "approval", template_id: null })
            .eq("business_id", businessId).eq("template_id", id);
        const { error } = await admin.from("review_reply_templates").delete().eq("id", id).eq("business_id", businessId);
        if (error) throw error;
        return apiOk({ id });
    } catch (error) {
        return fail(error, "Could not delete template");
    }
}
