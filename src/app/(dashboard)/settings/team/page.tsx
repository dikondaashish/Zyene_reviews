
import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { TeamTable } from "@/components/settings/team-table";
import { InviteMemberDialog } from "@/components/settings/invite-member-dialog";
import { Separator } from "@/components/ui/separator";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import {
    BusinessContextEmptyState,
    TeamMembershipEmptyState,
} from "@/components/dashboard/business-context-empty-state";
import { Users } from "lucide-react";

export default async function TeamSettingsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { businessId, business } = await getActiveBusinessId();

    if (!businessId || !business) {
        return (
            <BusinessContextEmptyState
                icon={Users}
                title="Add a business to manage team"
                description="Invites and roles are per business. Add a location first, then invite teammates for that business only."
            />
        );
    }

    // Fetch current user's membership for the active business
    const { data: currentUserMember } = await supabase
        .from("business_members")
        .select("role, business_id")
        .eq("user_id", user.id)
        .eq("business_id", businessId)
        .single();

    if (!currentUserMember) {
        return <TeamMembershipEmptyState businessName={business.name} />;
    }

    const { data: members } = await supabase
        .from("business_members")
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
        .eq("business_id", businessId);

    // Fetch pending invites
    const { data: invites } = await supabase
        .from("invitations")
        .select("*")
        .eq("business_id", businessId)
        .is("accepted_at", null);

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
                        Manage team members for {business.name ?? "this business"}.
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
