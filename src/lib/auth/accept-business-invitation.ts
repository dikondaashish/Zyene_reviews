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
};

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

    const invitationsTable = admin.from("invitations" as never);

    let inviteResult = await invitationsTable
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

    if (!invite) return { accepted: false };
    if (invite.email.toLowerCase() !== userEmail.toLowerCase()) return { accepted: false };
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

    await (invitationsTable as any).update({ accepted_at: new Date().toISOString() }).eq("id", invite.id);

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
        console.error("[acceptBusinessInvitationAdmin] team.member_joined event insert failed:", e);
    }

    const { error: userUpdErr } = await admin
        .from("users")
        .update({ onboarding_completed: true })
        .eq("id", userId);
    if (userUpdErr) {
        console.error("[acceptBusinessInvitationAdmin] onboarding_completed update failed:", userUpdErr);
    }

    try {
        await redis.del(`user_businesses:${userId}`);
    } catch (e) {
        console.error("[acceptBusinessInvitationAdmin] Redis cache clear failed:", e);
    }

    return { accepted: true, businessId };
}
