
import { createClient } from "@/lib/db/supabase/server";
import { sendEmail } from "@/services/resend/send-email";
import { TeamInviteEmail } from "@/services/resend/templates/team-invite-email";
import { apiOk, apiError } from "@/app/api/_shared/responses";
import { z } from "zod";
import { getActiveBusinessId } from "@/lib/auth/business-context";

const inviteSchema = z.object({
    email: z.string().email().max(255),
    role: z.enum(["admin", "manager", "member", "viewer"]),
});

export async function POST(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return apiError("Unauthorized", { status: 401 });
    }

    const parsed = inviteSchema.safeParse(await request.json());
    if (!parsed.success) {
        return apiError("Invalid input", { status: 400 });
    }
    const { email, role } = parsed.data;

    const { businessId, business, organization } = await getActiveBusinessId();
    if (!businessId || !business) {
        return apiError("No active business selected", { status: 400 });
    }

    // Verify admin/owner role for current business
    const { data: membership, error: membError } = await supabase
        .from("business_members")
        .select("role, business_id, users(full_name)")
        .eq("user_id", user.id)
        .eq("business_id", businessId)
        .in("role", ["owner", "admin"])
        .single();

    if (membError || !membership) {
        return apiError("Forbidden: Admins only", { status: 403 });
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
    const maxMembers = Number(organization?.max_team_members ?? 1);

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
        // Handle unique constraint violation (already invited)
        if (inviteError.code === "23505") {
            return apiError("User already invited", { status: 400 });
        }
        return apiError(inviteError.message, { status: 500 });
    }

    // Send email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://zyenereviews.com";
    const inviteLink = `${appUrl}/signup?invite=${invite.token}`;

    const inviterName = membershipTyped.users?.full_name || "A team member";
    const orgName = business.name || organization?.name || "Zyene Reviews";

    try {
        await sendEmail({
            to: email,
            subject: `Join ${orgName} on Zyene Reviews`,
            html: TeamInviteEmail(inviteLink, inviterName, orgName),
        });
    } catch (emailError) {
        console.error("Failed to send invite email:", emailError);
        // We don't rollback invite, just warn? Or return error?
        // Let's return success but log error. User can re-invite/resend.
    }

    return apiOk(invite);
}
