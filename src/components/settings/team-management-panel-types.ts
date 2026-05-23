export type TeamMemberRow = {
    id: string;
    role: string;
    type: "member" | "invite";
    userId?: string;
    user?: {
        full_name: string;
        email: string;
        avatar_url?: string;
    };
    email?: string;
    status: "active" | "invited";
};

export type TeamActivityRow = {
    id: string;
    message: string;
    createdAt: string;
};

export type TeamManagementPanelProps = {
    businessName: string;
    canInviteTeam: boolean;
    members: TeamMemberRow[];
    currentUserId: string;
    currentUserRole: string;
    activeMembersCount: number;
    pendingInvitesCount: number;
    maxMembers: number;
    latestInviteLink: string | null;
    latestInviteEmail: string | null;
    activity: TeamActivityRow[];
};
