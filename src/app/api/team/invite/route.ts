
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend/send-email";
import { TeamInviteEmail } from "@/lib/resend/templates/team-invite-email";
import { z } from "zod";

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
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = inviteSchema.safeParse(await request.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { email, role } = parsed.data;

    // Verify admin/owner role
    const { data: membership, error: membError } = await supabase
        .from("organization_members")
        .select("role, organization_id, organizations(name), users(full_name)") // users joined via user_id
        .eq("user_id", user.id)
        .in("role", ["owner", "admin"])
        .single();

    if (membError || !membership) {
        return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const organizationId = membership.organization_id;

    interface MembershipWithOrg {
        organizations: { name: string; max_team_members?: number } | null;
        users: { full_name: string | null } | null;
    }
    const membershipTyped = membership as unknown as MembershipWithOrg;

    // FIX 4.2: Enforce team member limit
    const org = membershipTyped.organizations;
    const maxMembers = org?.max_team_members ?? 1;

    const { count: currentMemberCount } = await supabase
        .from("organization_members")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId);

    const { count: pendingInviteCount } = await supabase
        .from("invitations")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .is("accepted_at", null);

    const totalSeats = (currentMemberCount || 0) + (pendingInviteCount || 0);
    if (totalSeats >= maxMembers) {
        return NextResponse.json(
            { error: "Team member limit reached. Please upgrade your plan." },
            { status: 403 }
        );
    }

    // Insert invitation
    const { data: invite, error: inviteError } = await supabase
        .from("invitations")
        .insert({
            organization_id: organizationId,
            email,
            role,
        })
        .select()
        .single();

    if (inviteError) {
        // Handle unique constraint violation (already invited)
        if (inviteError.code === "23505") {
            return NextResponse.json({ error: "User already invited" }, { status: 400 });
        }
        return NextResponse.json({ error: inviteError.message }, { status: 500 });
    }

    // Send email
    // Link format: app.zyenereviews.com/signup?invite=TOKEN
    // Or login page if they have account?
    // For now: signup
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const inviteLink = rootDomain.includes("localhost")
        ? `${process.env.NEXT_PUBLIC_APP_URL}/signup?invite=${invite.token}`
        : `https://auth.${rootDomain}/signup?invite=${invite.token}`;

    const inviterName = membershipTyped.users?.full_name || "A team member";
    const orgName = membershipTyped.organizations?.name || "Zyene";

    try {
        await sendEmail({
            to: email,
            subject: `Join ${orgName} on Zyene`,
            html: TeamInviteEmail(inviteLink, inviterName, orgName),
        });
    } catch (emailError) {
        console.error("Failed to send invite email:", emailError);
        // We don't rollback invite, just warn? Or return error?
        // Let's return success but log error. User can re-invite/resend.
    }

    return NextResponse.json({ success: true, invite });
}
