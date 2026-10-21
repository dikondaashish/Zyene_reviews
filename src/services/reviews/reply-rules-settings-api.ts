import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { planAllowsAutoCommenter } from "@/services/stripe/plans";
import { REPLY_RULE_ACTIONS } from "@/services/reviews/reply-rules";

const ruleSchema = z.object({
    rating: z.number().int().min(1).max(5),
    action: z.enum(REPLY_RULE_ACTIONS as [string, ...string[]]),
    templateId: z.uuid().nullable().optional(),
});
const putSchema = z.object({
    businessId: z.uuid(),
    enabled: z.boolean(),
    rules: z.array(ruleSchema).length(5),
    approverUserIds: z.array(z.uuid()).max(20),
}).refine((v) => new Set(v.rules.map((r) => r.rating)).size === 5, "One rule per star rating");

function fail(error: unknown, fallback: string) {
    if (!(error instanceof ApiRouteError)) logger.error({ err: error }, `[reply-rules] ${fallback}`);
    const e = toApiError(error);
    return apiError(e.status >= 500 ? fallback : e.message, { status: e.status, code: e.code });
}

export async function loadReplyRuleSettings(admin: SupabaseClient, businessId: string) {
    const [{ data: business }, { data: rules }, { data: approvers }, { data: templates }] = await Promise.all([
        admin.from("businesses").select("reply_rules_enabled").eq("id", businessId).maybeSingle(),
        admin.from("review_reply_rules").select("rating, action, template_id").eq("business_id", businessId),
        admin.from("review_reply_approvers").select("user_id").eq("business_id", businessId),
        admin.from("review_reply_templates").select("id, name, body").eq("business_id", businessId).order("created_at"),
    ]);
    const byRating = new Map((rules ?? []).map((r) => [r.rating as number, r]));
    return {
        enabled: Boolean(business?.reply_rules_enabled),
        // Unset ratings default to approval: nothing posts without a person approving it.
        rules: [5, 4, 3, 2, 1].map((rating) => ({
            rating, action: (byRating.get(rating)?.action as string | undefined) ?? "approval",
            templateId: (byRating.get(rating)?.template_id as string | null | undefined) ?? null,
        })),
        approverUserIds: (approvers ?? []).map((a) => a.user_id as string),
        templates: templates ?? [],
    };
}

export async function handleGetReplyRules(request: Request) {
    try {
        const businessId = z.uuid().safeParse(new URL(request.url).searchParams.get("businessId"));
        if (!businessId.success) throw new ApiRouteError("Invalid business", { status: 400 });
        const { supabase, user } = await requireUser();
        if (!(await userCanAccessBusiness(supabase, user.id, businessId.data))) throw new ApiRouteError("Forbidden", { status: 403 });
        return apiOk(await loadReplyRuleSettings(createAdminClient(), businessId.data));
    } catch (error) {
        return fail(error, "Could not load reply rules");
    }
}

export async function handlePutReplyRules(request: Request) {
    try {
        const parsed = putSchema.safeParse(await request.json());
        if (!parsed.success) throw new ApiRouteError("Invalid reply rules", { status: 400, details: parsed.error.message });
        const { businessId, enabled, rules, approverUserIds } = parsed.data;
        const { supabase, user } = await requireUser();
        if (!(await canManageBusinessIntegration(supabase, user.id, businessId))) {
            throw new ApiRouteError("Only owners, admins and managers can change reply rules", { status: 403 });
        }
        const admin = createAdminClient();
        const { data: business } = await admin.from("businesses")
            .select("reply_rules_enabled, organizations(plan, plan_status)").eq("id", businessId).maybeSingle();
        const org = (Array.isArray(business?.organizations) ? business?.organizations[0] : business?.organizations) as { plan?: string; plan_status?: string } | null;
        if (rules.some((r) => r.action === "auto" || r.action === "template") && !planAllowsAutoCommenter(org?.plan, org?.plan_status)) {
            throw new ApiRouteError("Posting replies automatically needs a plan with auto-replies", { status: 403, code: "AUTO_REPLY_PLAN_REQUIRED" });
        }
        const { data: templates } = await admin.from("review_reply_templates").select("id").eq("business_id", businessId);
        const templateIds = new Set((templates ?? []).map((t) => t.id as string));
        if (rules.some((r) => r.action === "template" && (!r.templateId || !templateIds.has(r.templateId)))) {
            throw new ApiRouteError("Choose a saved template for every template rule", { status: 400 });
        }
        for (const approver of approverUserIds) {
            if (!(await userCanAccessBusiness(admin, approver, businessId, true))) {
                throw new ApiRouteError("Approvers must be team members with access to this business", { status: 400 });
            }
        }

        const now = new Date().toISOString();
        const { error: rulesError } = await admin.from("review_reply_rules").upsert(rules.map((r) => ({
            business_id: businessId, rating: r.rating, action: r.action,
            template_id: r.action === "template" ? r.templateId : null, updated_at: now, updated_by: user.id,
        })), { onConflict: "business_id,rating" });
        if (rulesError) throw rulesError;
        const { error: deleteError } = await admin.from("review_reply_approvers").delete().eq("business_id", businessId);
        if (deleteError) throw deleteError;
        if (approverUserIds.length) {
            const { error: approverError } = await admin.from("review_reply_approvers")
                .insert([...new Set(approverUserIds)].map((id) => ({ business_id: businessId, user_id: id })));
            if (approverError) throw approverError;
        }
        const turningOn = enabled && !business?.reply_rules_enabled;
        const { error: bizError } = await admin.from("businesses").update({
            reply_rules_enabled: enabled, ...(turningOn ? { reply_rules_enabled_at: now } : {}),
        }).eq("id", businessId);
        if (bizError) throw bizError;
        return apiOk(await loadReplyRuleSettings(admin, businessId));
    } catch (error) {
        return fail(error, "Could not save reply rules");
    }
}
