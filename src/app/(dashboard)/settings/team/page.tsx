
import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import {
    BusinessContextEmptyState,
    TeamMembershipEmptyState,
} from "@/components/dashboard/business-context-empty-state";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import { canManageBusinessTeam } from "@/lib/team/business-team";
import { TeamManagementPanel } from "@/components/settings/team-management-panel";
import { buildTeamInviteSignupLink } from "@/lib/team/deliver-team-invite-email";
import { Users } from "lucide-react";

export default async function TeamSettingsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { businessId, business, organization } = await getActiveBusinessId();

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
    const { data: currentUserMember, error: currentUserMemberError } = await supabase
        .from("business_members")
        .select("role, business_id")
        .eq("user_id", user.id)
        .eq("business_id", businessId)
        .maybeSingle();
    if (currentUserMemberError && currentUserMemberError.code !== "PGRST116") {
        console.error("[Team settings] Current member fetch failed:", currentUserMemberError);
        return (
            <DashboardFetchError
                message="We could not load team permissions. Check your connection and try again."
                retryHref="/settings/team"
            />
        );
    }

    if (!currentUserMember) {
        return <TeamMembershipEmptyState businessName={business.name} />;
    }

    const canInviteTeam = canManageBusinessTeam(currentUserMember.role);

    const { data: members, error: membersError } = await supabase
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
    const { data: invites, error: invitesError } = await supabase
        .from("invitations")
        .select("*")
        .eq("business_id", businessId)
        .is("accepted_at", null);
    if (membersError || invitesError) {
        console.error("[Team settings] Team data fetch failed:", membersError || invitesError);
        return (
            <DashboardFetchError
                message="We could not load team members. Check your connection and try again."
                retryHref="/settings/team"
            />
        );
    }

    const combinedMembers = [
        ...(members || []).map((m: any) => ({
            id: m.id,
            role: m.role,
            type: "member" as const,
            userId: m.user_id as string,
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

    const activeMembersCount = (members || []).length;
    const pendingInvitesCount = (invites || []).length;
    const maxMembers = Number(organization?.max_team_members ?? 1);

    const newestPendingInvite = [...(invites || [])]
        .sort((a: any, b: any) => {
            const aa = new Date(a.created_at || 0).getTime();
            const bb = new Date(b.created_at || 0).getTime();
            return bb - aa;
        })
        .find((i: any) => typeof i.token === "string" && i.token.length > 0);

    const latestInviteLink =
        newestPendingInvite?.token
            ? buildTeamInviteSignupLink(newestPendingInvite.token)
            : null;
    const latestInviteEmail = newestPendingInvite?.email ?? null;

    const TEAM_EVENT_TYPES = [
        "team.invite_sent",
        "team.invite_resent",
        "team.member_joined",
        "team.role_changed",
        "team.member_removed",
        "team.invite_removed",
    ];

    const { data: teamEvents } = await supabase
        .from("events")
        .select("id, event_type, created_at, metadata")
        .eq("business_id", businessId)
        .in("event_type", TEAM_EVENT_TYPES)
        .order("created_at", { ascending: false })
        .limit(40);

    const activity = (teamEvents || []).map((event: any) => {
        const meta = (event.metadata || {}) as Record<string, unknown>;
        const safe = (value: unknown, fallback: string) =>
            typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;

        let message = "Team activity updated";
        switch (event.event_type) {
            case "team.member_joined":
                message = `${safe(meta.member_email, "A teammate")} joined as ${safe(meta.role, "member")}`;
                break;
            case "team.role_changed":
                message = `${safe(meta.actor_name, "Someone")} changed ${safe(meta.target_name, "a member")}'s role from ${safe(meta.from_role, "member")} to ${safe(meta.to_role, "member")}`;
                break;
            case "team.invite_sent":
                message = `Invite sent to ${safe(meta.invited_email, "teammate")}`;
                break;
            case "team.invite_resent":
                message = `Invite resent to ${safe(meta.invited_email, "teammate")}`;
                break;
            case "team.member_removed":
                message = `${safe(meta.actor_name, "Someone")} removed ${safe(meta.target_name, "a member")}`;
                break;
            case "team.invite_removed":
                message = `${safe(meta.actor_name, "Someone")} canceled invite for ${safe(meta.invited_email, "teammate")}`;
                break;
            default:
                break;
        }
        return {
            id: event.id as string,
            message,
            createdAt: event.created_at as string,
        };
    });

    return (
        <TeamManagementPanel
            businessName={business.name ?? "this business"}
            canInviteTeam={canInviteTeam}
            members={combinedMembers}
            currentUserId={user.id}
            currentUserRole={currentUserMember.role}
            activeMembersCount={activeMembersCount}
            pendingInvitesCount={pendingInvitesCount}
            maxMembers={maxMembers}
            latestInviteLink={latestInviteLink}
            latestInviteEmail={latestInviteEmail}
            activity={activity}
        />
    );
}
