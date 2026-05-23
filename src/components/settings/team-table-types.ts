export interface TeamTableMember {
    id: string;
    role: string;
    type: "member" | "invite";
    /** Present for rows backed by `business_members` (not pending invites). */
    userId?: string;
    user?: {
        full_name: string;
        email: string;
        avatar_url?: string;
    };
    email?: string;
    status: "active" | "invited";
}

export interface TeamTableProps {
    members: TeamTableMember[];
    currentUserId: string;
    currentUserRole: string;
}
