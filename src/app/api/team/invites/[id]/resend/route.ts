import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { apiOk, apiError } from "@/app/api/_shared/responses";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { canManageBusinessTeam } from "@/lib/team/business-team";
import {
    defaultInviteExpiresAtIso,
    deliverTeamInviteEmail,
} from "@/lib/team/deliver-team-invite-email";
import { z } from "zod";

const idSchema = z.string().uuid();

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiError("Unauthorized", { status: 401 });

    const { id: rawId } = await params;
    const idParsed = idSchema.safeParse(rawId);
    if (!idParsed.success) {
        return apiError("Invalid invitation id", { status: 400 });
    }
    const invitationId = idParsed.data;

    const { businessId, business, organization } = await getActiveBusinessId();
    if (!businessId || !business) {
        return apiError("No active business selected", { status: 400 });
    }

    const { data: membership, error: membError } = await supabase
        .from("business_members")
        .select("role, business_id, users(full_name)")
        .eq("user_id", user.id)
        .eq("business_id", businessId)
        .single();

    if (membError || !membership || !canManageBusinessTeam(membership.role)) {
        return apiError("Forbidden", { status: 403 });
    }

    interface MembershipWithUser {
        users: { full_name: string | null } | null;
    }
    const membershipTyped = membership as unknown as MembershipWithUser;

    const { data: row, error: invErr } = await supabase
        .from("invitations")
        .select("id, email, token, business_id, accepted_at")
        .eq("id", invitationId)
        .eq("business_id", businessId)
        .is("accepted_at", null)
        .maybeSingle();

    if (invErr || !row?.email || !row.token) {
        return apiError("Invitation not found or already accepted", { status: 404 });
    }

    const admin = createAdminClient();
    const { error: renewErr } = await admin
        .from("invitations")
        .update({ expires_at: defaultInviteExpiresAtIso() })
        .eq("id", row.id)
        .eq("business_id", businessId);

    if (renewErr) {
        console.error("[team/invites/resend] Failed to extend invite expiry:", renewErr);
        return apiError("Could not update invitation", { status: 500 });
    }

    const inviterName = membershipTyped.users?.full_name || "A team member";
    const orgName = business.name || organization?.name || "Zyene Reviews";
    const orgId =
        (typeof organization?.id === "string" && organization.id) ||
        (typeof business.organization_id === "string" && business.organization_id) ||
        "";

    const { sendResult, inviteLink } = await deliverTeamInviteEmail({
        to: row.email,
        inviteToken: row.token,
        inviterName,
        orgName,
    });

    const payloadBase = {
        invitation_id: row.id,
        invite_link: inviteLink,
        invited_email: row.email,
    };

    if (!sendResult.sent) {
        console.error("[team/invites/resend] Email delivery failed:", sendResult.error);
        try {
            if (!orgId) throw new Error("missing organization id");
            await supabase.from("events").insert({
                organization_id: orgId,
                business_id: businessId,
                user_id: user.id,
                event_type: "team.invite_resent",
                entity_type: "invitation",
                entity_id: row.id,
                metadata: {
                    invited_email: row.email,
                    email_delivered: false,
                    actor_name: inviterName,
                },
            });
        } catch (e) {
            console.error("[team/invites/resend] Failed to write event:", e);
        }
        return apiOk({
            ...payloadBase,
            email_delivered: false as const,
            email_delivery_error: sendResult.error ?? "Email could not be sent",
        });
    }

    try {
        if (!orgId) throw new Error("missing organization id");
        await supabase.from("events").insert({
            organization_id: orgId,
            business_id: businessId,
            user_id: user.id,
            event_type: "team.invite_resent",
            entity_type: "invitation",
            entity_id: row.id,
            metadata: {
                invited_email: row.email,
                email_delivered: true,
                actor_name: inviterName,
            },
        });
    } catch (e) {
        console.error("[team/invites/resend] Failed to write event:", e);
    }

    return apiOk({
        ...payloadBase,
        email_delivered: true as const,
        resend_email_id: sendResult.id,
    });
}
