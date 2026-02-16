
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend/send-email";
import { TeamInviteEmail } from "@/lib/resend/templates/team-invite-email";

export async function POST(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, role } = await request.json();

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

    // Check if user is already a member
    // We need to look up public.users by email to check existing membership?
    // Supabase standard `users` table isn't usually queryable by email by unprivileged users.
    // However, we can check `organization_members` if we had users table replicated or joined.
    // For now, we trust `invitations` unique constraint and check if `invitations` has it.

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
    // Link format: dashboard.zyeneratings.com/signup?invite=TOKEN
    // Or login page if they have account?
    // For now: signup
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const inviteLink = rootDomain.includes("localhost")
        ? `${process.env.NEXT_PUBLIC_APP_URL}/signup?invite=${invite.token}`
        : `http://auth.${rootDomain}/signup?invite=${invite.token}`;

    // @ts-ignore
    const inviterName = membership.users?.full_name || "A team member";
    // @ts-ignore
    const orgName = membership.organizations?.name || "Zyene";

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
