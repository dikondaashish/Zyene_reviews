import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { canManageBusinessTeam } from "@/lib/team/business-team";
import { buildTeamInviteSignupLink } from "@/lib/team/deliver-team-invite-email";
import { teamMemberLimitForPlan } from "@/services/stripe/plans";
import { TEAM_EVENT_TYPES, mapTeamSettingsActivity } from "./team-settings-activity";
import { memberUserFromJoin, type TeamPanelMember } from "./team-settings-types";

export type TeamSettingsPageData =
    | { kind: "error"; message: string }
    | { kind: "no-business" }
    | { kind: "no-membership"; businessName: string | null }
    | {
          kind: "ok";
          businessName: string;
          canInviteTeam: boolean;
          members: TeamPanelMember[];
          currentUserId: string;
          currentUserRole: string;
          activeMembersCount: number;
          pendingInvitesCount: number;
          maxMembers: number;
          latestInviteLink: string | null;
          latestInviteEmail: string | null;
          activity: ReturnType<typeof mapTeamSettingsActivity>;
      };

export async function loadTeamSettingsPage(userId: string): Promise<TeamSettingsPageData> {
    const [supabase, { businessId, business, organization }] = await Promise.all([
        createClient(),
        getActiveBusinessId(),
    ]);

    if (!businessId || !business) {
        return { kind: "no-business" };
    }

    const { data: currentUserMember, error: currentUserMemberError } = await supabase
        .from("business_members")
        .select("role, business_id")
        .eq("user_id", userId)
        .eq("business_id", businessId)
        .maybeSingle();

    if (currentUserMemberError && currentUserMemberError.code !== "PGRST116") {
        logger.error({ err: currentUserMemberError }, "[Team settings] Current member fetch failed:");
        return { kind: "error", message: "We could not load team permissions. Check your connection and try again." };
    }

    if (!currentUserMember) {
        return { kind: "no-membership", businessName: business.name ?? null };
    }

    const canInviteTeam = canManageBusinessTeam(currentUserMember.role);

    const [
        { data: members, error: membersError },
        { data: invites, error: invitesError },
    ] = await Promise.all([
        supabase
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
            .eq("business_id", businessId),
        supabase
            .from("invitations")
            .select("*")
            .eq("business_id", businessId)
            .is("accepted_at", null),
    ]);

    if (membersError || invitesError) {
        logger.error({ err: membersError || invitesError }, "[Team settings] Team data fetch failed:");
        return { kind: "error", message: "We could not load team members. Check your connection and try again." };
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

    const newestPendingInvite = [...(invites || [])]
        .sort((a, b) => {
            const aa = new Date(a.created_at || 0).getTime();
            const bb = new Date(b.created_at || 0).getTime();
            return bb - aa;
        })
        .find((i) => typeof i.token === "string" && i.token.length > 0);

    const { data: teamEvents } = await supabase
        .from("events")
        .select("id, event_type, created_at, metadata")
        .eq("business_id", businessId)
        .in("event_type", [...TEAM_EVENT_TYPES])
        .order("created_at", { ascending: false })
        .limit(40);

    return {
        kind: "ok",
        businessName: business.name ?? "this business",
        canInviteTeam,
        members: combinedMembers,
        currentUserId: userId,
        currentUserRole: currentUserMember.role,
        activeMembersCount: (members || []).length,
        pendingInvitesCount: (invites || []).length,
        maxMembers: teamMemberLimitForPlan(organization?.plan ?? null, organization?.plan_status ?? null),
        latestInviteLink: newestPendingInvite?.token ? buildTeamInviteSignupLink(newestPendingInvite.token) : null,
        latestInviteEmail: newestPendingInvite?.email ?? null,
        activity: mapTeamSettingsActivity(teamEvents),
    };
}
