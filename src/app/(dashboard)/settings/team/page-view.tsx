import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import {
    BusinessContextEmptyState,
    TeamMembershipEmptyState,
} from "@/components/dashboard/business-context-empty-state";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import { TeamManagementPanel } from "@/components/settings/team-management-panel";
import { Users } from "lucide-react";
import { loadTeamSettingsPage } from "./load-team-settings-page";

export default async function TeamSettingsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const data = await loadTeamSettingsPage(user.id);

    if (data.kind === "no-business") {
        return (
            <BusinessContextEmptyState
                icon={Users}
                title="Add a business to manage team"
                description="Invites and roles are per business. Add a location first, then invite teammates for that business only."
            />
        );
    }

    if (data.kind === "error") {
        return (
            <DashboardFetchError message={data.message} retryHref="/settings/team" />
        );
    }

    if (data.kind === "no-membership") {
        return <TeamMembershipEmptyState businessName={data.businessName} />;
    }

    return (
        <TeamManagementPanel
            businessName={data.businessName}
            canInviteTeam={data.canInviteTeam}
            members={data.members}
            currentUserId={data.currentUserId}
            currentUserRole={data.currentUserRole}
            activeMembersCount={data.activeMembersCount}
            pendingInvitesCount={data.pendingInvitesCount}
            maxMembers={data.maxMembers}
            latestInviteLink={data.latestInviteLink}
            latestInviteEmail={data.latestInviteEmail}
            activity={data.activity}
        />
    );
}
