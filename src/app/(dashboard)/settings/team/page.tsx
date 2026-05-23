
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
import { teamMemberLimitForPlan } from "@/services/stripe/plans";
import { Users } from "lucide-react";
import type { Json } from "@/lib/db/supabase/database.types";

type TeamPanelMember = {
    id: string;
    role: string;
    type: "member" | "invite";
    userId?: string;
    user?: { full_name: string; email: string; avatar_url?: string };
    email?: string;
    status: "active" | "invited";
};

function memberUserFromJoin(
    users: unknown
): { full_name: string; email: string; avatar_url?: string } | undefined {
    if (!users || typeof users !== "object") return undefined;
    const u = users as Record<string, unknown>;
    const full_name = typeof u.full_name === "string" ? u.full_name : "";
    const email = typeof u.email === "string" ? u.email : "";
    if (!full_name && !email) return undefined;
    return {
        full_name,
        email,
        avatar_url: typeof u.avatar_url === "string" ? u.avatar_url : undefined,
    };
}

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

    const combinedMembers: TeamPanelMember[] = [
        ...(members || []).map((m) => ({
            id: m.id,
            role: m.role,
            type: "member" as const,
            userId: m.user_id,
            user: memberUserFromJoin(m.users),
            status: (m.status === "invited" ? "invited" : "active") as "active" | "invited",
        })),
        ...(invites || []).map((i) => ({
            id: i.id,
            role: i.role,
            type: "invite" as const,
            email: i.email,
            status: "invited" as const,
        })),
    ];

    const activeMembersCount = (members || []).length;
    const pendingInvitesCount = (invites || []).length;
    const maxMembers = teamMemberLimitForPlan(
        organization?.plan ?? null,
        organization?.plan_status ?? null
    );

    const newestPendingInvite = [...(invites || [])]
        .sort((a, b) => {
            const aa = new Date(a.created_at || 0).getTime();
            const bb = new Date(b.created_at || 0).getTime();
            return bb - aa;
        })
        .find((i) => typeof i.token === "string" && i.token.length > 0);

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

    const activity = (teamEvents || []).map((event) => {
        const rawMeta = event.metadata as Json | null;
        const meta =
            rawMeta && typeof rawMeta === "object" && !Array.isArray(rawMeta)
                ? (rawMeta as Record<string, unknown>)
                : {};
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
