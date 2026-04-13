
import { createClient } from "@/lib/db/supabase/server";
import { sendEmail } from "@/services/resend/send-email";
import { TeamInviteEmail } from "@/services/resend/templates/team-invite-email";
import { apiOk, apiError } from "@/app/api/_shared/responses";
import { z } from "zod";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { canManageBusinessTeam, INVITE_ROLE_VALUES } from "@/lib/team/business-team";

const inviteRoleSchema = z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
    z.enum(INVITE_ROLE_VALUES as unknown as [string, ...string[]])
);

const inviteSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Enter a valid email address")
        .max(255)
        .transform((e) => e.toLowerCase()),
    role: inviteRoleSchema,
});

export async function POST(request: Request) {
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
    const parsed = inviteSchema.safeParse(body);
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

    // Verify owner / admin / manager on this business
    const { data: membership, error: membError } = await supabase
        .from("business_members")
        .select("role, business_id, users(full_name)")
        .eq("user_id", user.id)
        .eq("business_id", businessId)
        .single();

    if (membError || !membership || !canManageBusinessTeam(membership.role)) {
        return apiError("Forbidden: Insufficient permissions to invite", { status: 403 });
    }

    interface MembershipWithOrg {
        users: { full_name: string | null } | null;
    }
    const membershipTyped = membership as unknown as MembershipWithOrg;

    const organizationId = organization?.id;
    const resolvedOrganizationId = organizationId ?? (business.organization_id as string | undefined);
    if (!resolvedOrganizationId) {
        return apiError("Organization not found for active business", { status: 400 });
    }
    let maxMembersRaw: unknown = organization?.max_team_members;
    if (maxMembersRaw == null || Number.isNaN(Number(maxMembersRaw))) {
        const { data: orgRow } = await supabase
            .from("organizations")
            .select("max_team_members")
            .eq("id", resolvedOrganizationId)
            .maybeSingle();
        maxMembersRaw = orgRow?.max_team_members ?? 1;
    }
    const maxMembers = Number(maxMembersRaw);

    const { data: existingMembers } = await supabase
        .from("business_members")
        .select("users(email)")
        .eq("business_id", businessId);

    const alreadyOnTeam = (existingMembers ?? []).some((row: { users?: { email?: string | null } | null }) => {
        const memberEmail = row.users?.email?.trim().toLowerCase();
        return memberEmail === email;
    });
    if (alreadyOnTeam) {
        return apiError("This person is already on the team for this business.", { status: 400 });
    }

    const { count: currentMemberCount } = await supabase
        .from("business_members")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId);

    const { count: pendingInviteCount } = await supabase
        .from("invitations")
        .select("*", { count: "exact", head: true })
        .eq("business_id", businessId)
        .is("accepted_at", null);

    const totalSeats = Number(currentMemberCount || 0) + Number(pendingInviteCount || 0);
    if (totalSeats >= maxMembers) {
        return apiError("Team member limit reached. Please upgrade your plan.", { status: 403 });
    }

    // Insert invitation
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

    // Send email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zyenereviews.com";
    const inviteLink = `${appUrl}/signup?invite=${invite.token}`;

    const inviterName = membershipTyped.users?.full_name || "A team member";
    const orgName = business.name || organization?.name || "Zyene Reviews";

    const sendResult = await sendEmail({
        to: email,
        subject: `Join ${orgName} on Zyene Reviews`,
        html: TeamInviteEmail(inviteLink, inviterName, orgName),
    });

    if (!sendResult.sent) {
        console.error("[team/invite] Email delivery failed:", sendResult.error);
        return apiOk({
            ...invite,
            email_delivered: false as const,
            email_delivery_error: sendResult.error ?? "Email could not be sent",
            invite_link: inviteLink,
        });
    }

    return apiOk({
        ...invite,
        email_delivered: true as const,
    });
}
