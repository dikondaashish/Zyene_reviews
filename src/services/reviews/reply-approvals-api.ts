import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { canManageBusinessIntegration } from "@/lib/auth/manage-business-integration";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { postGoogleReplySystem } from "@/services/reviews/post-google-reply-system";
import { listDesignatedApprovers } from "@/services/reviews/reply-rules";

type UserClient = Awaited<ReturnType<typeof requireUser>>["supabase"];

/** Designated approvers (must still have write access) or, if none are set, owners/admins/managers. */
export async function canApproveReplies(supabase: UserClient, admin: SupabaseClient, userId: string, businessId: string): Promise<boolean> {
    const designated = await listDesignatedApprovers(admin, businessId);
    if (designated.length) return designated.includes(userId) && await userCanAccessBusiness(supabase, userId, businessId, true);
    return canManageBusinessIntegration(supabase, userId, businessId);
}

function fail(error: unknown, fallback: string) {
    if (!(error instanceof ApiRouteError)) logger.error({ err: error }, `[reply-approvals] ${fallback}`);
    const e = toApiError(error);
    // Our own ApiRouteError messages are safe to show; unexpected errors get the generic text.
    return apiError(e.status >= 500 && !(error instanceof ApiRouteError) ? fallback : e.message, { status: e.status, code: e.code });
}

export async function handleListReplyApprovals(request: Request) {
    try {
        const businessId = z.uuid().safeParse(new URL(request.url).searchParams.get("businessId"));
        if (!businessId.success) throw new ApiRouteError("Invalid business", { status: 400 });
        const { supabase, user } = await requireUser();
        if (!(await userCanAccessBusiness(supabase, user.id, businessId.data))) throw new ApiRouteError("Forbidden", { status: 403 });
        const admin = createAdminClient();
        const { data, error } = await admin.from("review_reply_drafts")
            .select("id, review_id, rating, draft_text, source, status, error, created_at, reviews(author_name, rating, text, review_date)")
            .eq("business_id", businessId.data).in("status", ["pending", "failed"]).order("created_at", { ascending: false }).limit(50);
        if (error) throw error;
        const canApprove = await canApproveReplies(supabase, admin, user.id, businessId.data);
        return apiOk({ drafts: data ?? [], canApprove });
    } catch (error) {
        return fail(error, "Could not load approvals");
    }
}

const decideSchema = z.object({ action: z.enum(["approve", "reject"]), text: z.string().trim().min(3).max(4096).optional() });

export async function handleDecideReplyApproval(request: Request, draftId: string) {
    try {
        if (!z.uuid().safeParse(draftId).success) throw new ApiRouteError("Invalid draft", { status: 400 });
        const parsed = decideSchema.safeParse(await request.json());
        if (!parsed.success) throw new ApiRouteError("Invalid payload", { status: 400 });
        const { supabase, user } = await requireUser();
        const admin = createAdminClient();
        const { data: draft } = await admin.from("review_reply_drafts")
            .select("id, business_id, review_id, draft_text, status").eq("id", draftId).maybeSingle();
        // Same 404 for missing and other-tenant drafts.
        if (!draft || !(await userCanAccessBusiness(supabase, user.id, draft.business_id))) throw new ApiRouteError("Draft not found", { status: 404 });
        if (!(await canApproveReplies(supabase, admin, user.id, draft.business_id))) {
            throw new ApiRouteError("Only designated approvers can approve or reject replies for this business", { status: 403 });
        }
        const now = new Date().toISOString();
        const decided = { decided_by: user.id, decided_at: now, updated_at: now };

        if (parsed.data.action === "reject") {
            const { data: rejected } = await admin.from("review_reply_drafts").update({ status: "rejected", ...decided })
                .eq("id", draft.id).in("status", ["pending", "failed"]).select("id").maybeSingle();
            if (!rejected) throw new ApiRouteError("This draft was already handled", { status: 409 });
            return apiOk({ id: draft.id, status: "rejected" });
        }

        const text = parsed.data.text ?? (draft.draft_text as string);
        // Atomic claim: two approvers clicking at once cannot both post.
        const { data: claimed } = await admin.from("review_reply_drafts").update({ status: "posting", draft_text: text, ...decided })
            .eq("id", draft.id).in("status", ["pending", "failed"]).select("id").maybeSingle();
        if (!claimed) throw new ApiRouteError("This draft was already handled", { status: 409 });
        try {
            const posted = await postGoogleReplySystem(draft.review_id as string, text, { approved: true });
            const status = posted ? "posted" : "superseded";
            await admin.from("review_reply_drafts").update({
                status, posted_at: posted ? new Date().toISOString() : null,
                error: posted ? null : "The review was already answered, so nothing was posted",
            }).eq("id", draft.id);
            return apiOk({ id: draft.id, status });
        } catch (postError) {
            logger.error({ err: postError, draftId }, "[reply-approvals] post failed");
            await admin.from("review_reply_drafts").update({ status: "failed", error: "Google did not accept the reply. Try again." }).eq("id", draft.id);
            throw new ApiRouteError("Google did not accept the reply. Try again.", { status: 502 });
        }
    } catch (error) {
        return fail(error, "Could not update the reply");
    }
}
