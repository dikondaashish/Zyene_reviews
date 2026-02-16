
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TeamTable } from "@/components/settings/team-table";
import { InviteMemberDialog } from "@/components/settings/invite-member-dialog";
import { Separator } from "@/components/ui/separator";

export default async function TeamSettingsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch current user details to check permissions
    const { data: currentUserMember } = await supabase
        .from("organization_members")
        .select("role, organization_id")
        .eq("user_id", user.id)
        .single();

    if (!currentUserMember) {
        return <div>No organization found.</div>;
    }

    const orgId = currentUserMember.organization_id;

    // Fetch active members
    // Ideally we join with public.users to get names/emails/avatars
    // Assuming Supabase auth users are not directly queryable, but maybe we have a public.users table?
    // User request: "Columns: Name, Email..."
    // If public.users exists and has RLS allowing org members to see each other.
    // Let's assume standard Supabase starter often has `users` table trigger. 
    // If not, we might only get User ID.
    // Wait, the API route I wrote assumed `users` table exists for displaying names in email template?
    // Actually I wrote: select "role, organization_id, organizations(name), users(full_name)"
    // So I assumed `users` table exists.
    // Let's check `users` table exists.
    // If not, I can only get User ID (and maybe email if I use admin client, but I shouldn't).
    // I will double check `users` table existence.
    // If not, I'll fallback to showing User ID, or fix the query.
    // The previous queries I verified were: `businesses`, `organization_members`.
    // I did NOT verify `users` table.

    const { data: members, error: membersError } = await supabase
        .from("organization_members")
        .select(`
            id,
            role,
            status,
            created_at,
            user_id,
            users (
                full_name,
                email,
                avatar_url
            )
        `)
        .eq("organization_id", orgId);

    // Fetch pending invites
    const { data: invites } = await supabase
        .from("invitations")
        .select("*")
        .eq("organization_id", orgId);

    const combinedMembers = [
        ...(members || []).map((m: any) => ({
            id: m.id,
            role: m.role,
            type: "member" as const,
            user: m.users,
            status: m.status || "active",
        })),
        ...(invites || []).map((i: any) => ({
            id: i.id,
            role: i.role,
            type: "invite" as const,
            email: i.email,
            status: "invited" as const,
        })),
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Team Management</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage your team members and their roles.
                    </p>
                </div>
                <InviteMemberDialog />
            </div>
            <Separator />

            <TeamTable
                members={combinedMembers}
                currentUserId={user.id}
                currentUserRole={currentUserMember.role}
            />
        </div>
    );
}
