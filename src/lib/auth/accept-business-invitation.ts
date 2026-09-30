import { logger } from "@/lib/logger";
import type { createAdminClient } from "@/lib/db/supabase/admin";
import { clearBusinessContextCache } from "@/lib/auth/business-context-load";

type AdminClient = ReturnType<typeof createAdminClient>;
const INVITATION_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Callers pass the identity and email from auth.getUser(), never form values. */
export async function acceptBusinessInvitationAdmin(params: {
    admin: AdminClient;
    userId: string;
    userEmail: string | null | undefined;
    inviteParam: string | null | undefined;
}): Promise<{ accepted: false } | { accepted: true; businessId: string }> {
    const { admin, userId, userEmail, inviteParam } = params;
    const raw = typeof inviteParam === "string" ? inviteParam.trim() : "";
    if (!raw || raw.length > 256 || !userEmail) return { accepted: false };

    const email = userEmail.trim().toLowerCase();
    let result = await admin.from("invitations").select("id, email")
        .eq("token", raw).maybeSingle();
    if (result.error) throw result.error;
    if (!result.data && INVITATION_ID_RE.test(raw)) {
        result = await admin.from("invitations").select("id, email")
            .eq("id", raw).maybeSingle();
        if (result.error) throw result.error;
    }
    if (!result.data || result.data.email.trim().toLowerCase() !== email) return { accepted: false };

    const { data: businessId, error } = await admin.rpc("accept_business_invitation" as never, {
        p_invitation_id: result.data.id, p_user_id: userId, p_verified_email: email,
    } as never);
    if (error) throw error;
    if (typeof businessId !== "string") return { accepted: false };

    const { error: userError } = await admin.from("users")
        .update({ onboarding_completed: true }).eq("id", userId);
    if (userError) logger.error({ err: userError }, "Invitation onboarding progress update failed");
    await clearBusinessContextCache(userId);
    return { accepted: true, businessId };
}
