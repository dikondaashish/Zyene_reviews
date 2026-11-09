import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { isOrganizationOwnerRole } from "@/lib/organization/organization-permissions";
import { createDefaultBusiness, provisionDefaultWorkspace, workspaceSlug } from "./default-workspace";

export type RecoverWorkspaceResult =
    | { success: true; repaired: boolean }
    | { success: false; error: string };

const SUPPORT_HINT =
    "If this keeps happening, email support@zyenereviews.com, or sign out from the account menu and try another account.";

/**
 * Finishes account setup for someone who reached onboarding without an organization or
 * business (for example a signup that failed half way before rollback existed). Safe to
 * call repeatedly: it only creates what is missing, and never for an invited teammate.
 */
export async function recoverOnboardingWorkspace(
    admin: SupabaseClient,
    user: { id: string; email?: string | null; fullName?: string | null },
): Promise<RecoverWorkspaceResult> {
    const fullName = user.fullName?.trim() || user.email?.split("@")[0] || "User";

    const { data: orgMember, error: orgMemberErr } = await admin
        .from("organization_members")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
    if (orgMemberErr) {
        logger.error({ err: orgMemberErr, userId: user.id }, "[onboarding-recovery] membership lookup failed");
        return { success: false, error: `We couldn't load your account. ${SUPPORT_HINT}` };
    }

    if (orgMember?.organization_id) {
        const organizationId = orgMember.organization_id as string;
        const { data: business } = await admin
            .from("businesses")
            .select("id")
            .eq("organization_id", organizationId)
            .limit(1)
            .maybeSingle();
        if (business?.id) return { success: true, repaired: false };
        if (!isOrganizationOwnerRole(orgMember.role as string | null)) {
            return { success: false, error: `Your workspace has no business yet. Ask its owner to add one. ${SUPPORT_HINT}` };
        }
        const created = await createDefaultBusiness(admin, {
            userId: user.id,
            organizationId,
            fullName,
            slug: workspaceSlug(fullName),
        });
        if (!created.ok) {
            logger.error({ err: created.error, step: created.step, userId: user.id }, "[onboarding-recovery] business setup failed");
            return { success: false, error: `We couldn't finish setting up your business. ${SUPPORT_HINT}` };
        }
        return { success: true, repaired: true };
    }

    const { data: bizMember } = await admin
        .from("business_members")
        .select("business_id, role")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
    if (bizMember?.business_id) {
        // Older signups could save the business owner row but silently miss the org membership.
        // Re-link only when the user owns the business and its organization has no members at all;
        // an invited teammate's business always has its owner's membership, so it is never adopted.
        const adopted = await adoptOrphanedOrganization(admin, user.id, bizMember);
        if (adopted) return { success: true, repaired: true };
        return { success: false, error: `Your account is linked to a business but not its workspace. ${SUPPORT_HINT}` };
    }

    // Memberships reference users(id); restore the profile row if an earlier failure lost it.
    if (user.email) {
        const { error: userRowErr } = await admin
            .from("users")
            .upsert({ id: user.id, email: user.email, full_name: fullName }, { onConflict: "id", ignoreDuplicates: true });
        if (userRowErr) logger.warn({ err: userRowErr, userId: user.id }, "[onboarding-recovery] user row upsert failed");
    }

    const workspace = await provisionDefaultWorkspace(admin, { userId: user.id, fullName });
    if (!workspace.ok) {
        logger.error({ err: workspace.error, step: workspace.step, userId: user.id }, "[onboarding-recovery] workspace setup failed");
        return { success: false, error: `We couldn't finish setting up your account. ${SUPPORT_HINT}` };
    }
    return { success: true, repaired: true };
}

async function adoptOrphanedOrganization(
    admin: SupabaseClient,
    userId: string,
    bizMember: { business_id: string; role?: string | null },
): Promise<boolean> {
    if (bizMember.role !== "owner") return false;
    const { data: business } = await admin
        .from("businesses")
        .select("organization_id")
        .eq("id", bizMember.business_id)
        .maybeSingle();
    const organizationId = business?.organization_id as string | undefined;
    if (!organizationId) return false;
    const { data: existing, error: lookupErr } = await admin
        .from("organization_members")
        .select("user_id")
        .eq("organization_id", organizationId)
        .limit(1)
        .maybeSingle();
    if (lookupErr || existing) return false;
    const { error } = await admin.from("organization_members").insert({
        organization_id: organizationId,
        user_id: userId,
        role: "ORG_OWNER",
        status: "active",
    });
    if (error) {
        logger.error({ err: error, userId }, "[onboarding-recovery] re-linking organization failed");
        return false;
    }
    return true;
}
