import { createClient } from "@/lib/db/supabase/server";
import { apiOk, apiError } from "@/app/api/_shared/responses";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import {
    canInviterAssignInviteRole,
    canManageBusinessTeam,
} from "@/lib/team/business-team";
import { teamInviteSchema } from "./invite-schema";
import { assertTeamInviteSeatAvailable } from "./invite-seat-checks";
import { deliverTeamInviteAndLogEvent } from "./invite-delivery";

export async function handleTeamInvite(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return apiError("Unauthorized", { status: 401 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return apiError("Invalid JSON body", { status: 400 });
    }
    const parsed = teamInviteSchema.safeParse(body);
    if (!parsed.success) {
        const msg = parsed.error.issues[0]?.message ?? "Invalid input";
        return apiError(msg, { status: 400 });
    }
    const { email, role } = parsed.data;

    if (user.email && email === user.email.trim().toLowerCase()) {
        return apiError("You cannot invite yourself.", { status: 400 });
    }

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
        return apiError("Forbidden: Insufficient permissions to invite", { status: 403 });
    }

    if (!canInviterAssignInviteRole(membership.role, role)) {
        const isManager = String(membership.role || "").toLowerCase() === "manager";
        return apiError(
            isManager
                ? "Managers may only invite teammates as Manager or Member."
                : "You cannot assign that role with your current permissions.",
            { status: 403 }
        );
    }

    interface MembershipWithOrg {
        users: { full_name: string | null } | null;
    }
    const membershipTyped = membership as unknown as MembershipWithOrg;

    const resolvedOrganizationId = organization?.id ?? (business.organization_id as string | undefined);
    if (!resolvedOrganizationId) {
        return apiError("Organization not found for active business", { status: 400 });
    }

    const seatError = await assertTeamInviteSeatAvailable(supabase, {
        businessId,
        email,
        organizationId: resolvedOrganizationId,
        plan: organization?.plan,
        planStatus: organization?.plan_status,
    });
    if (seatError) return seatError;

    const { data: invite, error: inviteError } = await supabase
        .from("invitations")
        .insert({
            organization_id: resolvedOrganizationId,
            business_id: businessId,
            email,
            role,
        })
        .select()
        .single();

    if (inviteError) {
        if (inviteError.code === "23505") {
            return apiError("User already invited", { status: 400 });
        }
        if (inviteError.code === "23514") {
            return apiError(
                "Invalid role for invitation. Try again or contact support if this persists.",
                { status: 400 }
            );
        }
        return apiError(inviteError.message, { status: 500 });
    }

    const inviterName = membershipTyped.users?.full_name || "A team member";
    const orgName = business.name || organization?.name || "Zyene Reviews";

    return deliverTeamInviteAndLogEvent(supabase, {
        invite,
        email,
        role,
        inviterName,
        orgName,
        organizationId: resolvedOrganizationId,
        businessId,
        userId: user.id,
    });
}
