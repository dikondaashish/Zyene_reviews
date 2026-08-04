import { logger } from "@/lib/logger";
import type { createAdminClient } from "@/lib/db/supabase/admin";
import { redis } from "@/lib/db/redis";

type AdminClient = ReturnType<typeof createAdminClient>;

/** Invitation primary key (UUID) shape — used when invite links mistakenly use `id` instead of `token`. */
const INVITATION_ID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type InviteRow = {
    id: string;
    email: string;
    role: string;
    business_id: string | null;
    organization_id: string;
    expires_at: string | null;
    accepted_at?: string | null;
};

/** Maps `business_members` / invitation role to `organization_members.role` (CHECK allows ORG_*). */
function mapInviteBusinessRoleToOrgRole(inviteRole: string): string {
    switch (inviteRole) {
        case "admin":
            return "ORG_ADMIN";
        case "manager":
            return "ORG_MANAGER";
        case "viewer":
            return "viewer";
        case "member":
        default:
            return "ORG_EMPLOYEE";
    }
}

async function ensureOrganizationMembershipForInvite(
    admin: AdminClient,
    organizationId: string,
    userId: string,
    inviteRole: string
): Promise<void> {
    const orgRole = mapInviteBusinessRoleToOrgRole(inviteRole);
    const { error } = await admin.from("organization_members").upsert(
        {
            organization_id: organizationId,
            user_id: userId,
            role: orgRole,
            status: "active",
        },
        { onConflict: "organization_id,user_id" }
    );
    if (error) {
        logger.error({ err: error }, "[acceptBusinessInvitationAdmin] organization_members upsert failed:");
        throw error;
    }
}

/**
 * Accept a pending business invitation: `business_members` row, mark invite accepted,
 * and skip full product onboarding (invited users join an existing org/business).
 */
export async function acceptBusinessInvitationAdmin(params: {
    admin: AdminClient;
    userId: string;
    userEmail: string | null | undefined;
    inviteParam: string | null | undefined;
}): Promise<{ accepted: false } | { accepted: true; businessId: string }> {
    const { admin, userId, userEmail, inviteParam } = params;
    const raw = typeof inviteParam === "string" ? inviteParam.trim() : "";
    if (!raw || !userEmail) return { accepted: false };

    const emailNorm = userEmail.trim().toLowerCase();
    const invitationsTable = admin.from("invitations");

    const inviteResult = await invitationsTable
        .select("id, email, role, business_id, organization_id, expires_at, accepted_at")
        .eq("token", raw)
        .is("accepted_at", null)
        .maybeSingle();

    let invite = inviteResult.data as InviteRow | null;

    if (!invite && INVITATION_ID_RE.test(raw)) {
        const byId = await invitationsTable
            .select("id, email, role, business_id, organization_id, expires_at, accepted_at")
            .eq("id", raw)
            .is("accepted_at", null)
            .maybeSingle();
        invite = byId.data as InviteRow | null;
    }

    if (!invite) {
        // Invite may already have been accepted (e.g. auth callback ran first; user still lands on /signup?invite=).
        const anyByToken = await invitationsTable
            .select("id, email, role, business_id, organization_id, expires_at, accepted_at")
            .eq("token", raw)
            .maybeSingle();
        let anyInvite = anyByToken.data as InviteRow | null;
        if (!anyInvite && INVITATION_ID_RE.test(raw)) {
            const anyById = await invitationsTable
                .select("id, email, role, business_id, organization_id, expires_at, accepted_at")
                .eq("id", raw)
                .maybeSingle();
            anyInvite = anyById.data as InviteRow | null;
        }
        if (!anyInvite || anyInvite.email.toLowerCase() !== emailNorm) {
            return { accepted: false };
        }
        if (!anyInvite.accepted_at) {
            return { accepted: false };
        }
        let businessIdResolved = anyInvite.business_id;
        if (!businessIdResolved) {
            const { data: firstBusiness } = await admin
                .from("businesses")
                .select("id")
                .eq("organization_id", anyInvite.organization_id)
                .order("created_at", { ascending: true })
                .limit(1)
                .maybeSingle();
            businessIdResolved = firstBusiness?.id ?? null;
        }
        if (!businessIdResolved) {
            return { accepted: false };
        }
        const { data: alreadyMember } = await admin
            .from("business_members")
            .select("user_id")
            .eq("business_id", businessIdResolved)
            .eq("user_id", userId)
            .maybeSingle();
        if (alreadyMember) {
            await ensureOrganizationMembershipForInvite(
                admin,
                anyInvite.organization_id,
                userId,
                anyInvite.role
            );
            try {
                await redis.del(`user_businesses:${userId}`);
            } catch (e) {
                logger.error({ err: e }, "[acceptBusinessInvitationAdmin] Redis cache clear failed:");
            }
            return { accepted: true, businessId: businessIdResolved };
        }
        // Rare: invite marked accepted but membership row missing — repair.
        const roleRepair = ["owner", "admin", "manager", "member", "viewer"].includes(anyInvite.role)
            ? anyInvite.role
            : "member";
        await admin.from("business_members").upsert(
            {
                business_id: businessIdResolved,
                user_id: userId,
                role: roleRepair,
                status: "active",
            },
            { onConflict: "business_id,user_id" }
        );
        await ensureOrganizationMembershipForInvite(
            admin,
            anyInvite.organization_id,
            userId,
            anyInvite.role
        );
        try {
            await redis.del(`user_businesses:${userId}`);
        } catch (e) {
            logger.error({ err: e }, "[acceptBusinessInvitationAdmin] Redis cache clear failed:");
        }
        return { accepted: true, businessId: businessIdResolved };
    }

    if (invite.email.toLowerCase() !== emailNorm) return { accepted: false };
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) return { accepted: false };

    let businessId = invite.business_id;
    if (!businessId) {
        const { data: firstBusiness } = await admin
            .from("businesses")
            .select("id")
            .eq("organization_id", invite.organization_id)
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle();
        businessId = firstBusiness?.id ?? null;
    }
    if (!businessId) return { accepted: false };

    const role = ["owner", "admin", "manager", "member", "viewer"].includes(invite.role)
        ? invite.role
        : "member";

    await admin.from("business_members").upsert(
        {
            business_id: businessId,
            user_id: userId,
            role,
            status: "active",
        },
        { onConflict: "business_id,user_id" }
    );

    await ensureOrganizationMembershipForInvite(admin, invite.organization_id, userId, invite.role);

    await invitationsTable.update({ accepted_at: new Date().toISOString() }).eq("id", invite.id);

    try {
        await admin.from("events").insert({
            organization_id: invite.organization_id,
            business_id: businessId,
            user_id: userId,
            event_type: "team.member_joined",
            entity_type: "business_member",
            entity_id: userId,
            metadata: {
                member_email: userEmail,
                role,
            },
        });
    } catch (e) {
        logger.error({ err: e }, "[acceptBusinessInvitationAdmin] team.member_joined event insert failed:");
    }

    const { error: userUpdErr } = await admin
        .from("users")
        .update({ onboarding_completed: true })
        .eq("id", userId);
    if (userUpdErr) {
        logger.error({ err: userUpdErr }, "[acceptBusinessInvitationAdmin] onboarding_completed update failed:");
    }

    try {
        await redis.del(`user_businesses:${userId}`);
    } catch (e) {
        logger.error({ err: e }, "[acceptBusinessInvitationAdmin] Redis cache clear failed:");
    }

    return { accepted: true, businessId };
}
