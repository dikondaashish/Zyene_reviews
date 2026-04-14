/** Roles stored on `business_members.role` (matches DB CHECK). */
export const BUSINESS_MEMBER_ROLES = ["owner", "admin", "manager", "member", "viewer"] as const;
export type BusinessMemberRole = (typeof BUSINESS_MEMBER_ROLES)[number];

/** Roles allowed on `invitations.role` (matches DB CHECK). */
export const INVITE_ROLE_VALUES = ["admin", "manager", "member", "viewer"] as const;
export type InviteRole = (typeof INVITE_ROLE_VALUES)[number];

/**
 * Which invite roles an inviter may assign (business-scoped).
 * Managers may only invite peers or members — not admin (owners/admins can invite admin).
 */
export function inviteRolesAssignableByInviter(inviterBusinessRole: string): InviteRole[] {
    const r = String(inviterBusinessRole || "").toLowerCase();
    if (r === "owner" || r === "admin") {
        return [...INVITE_ROLE_VALUES];
    }
    if (r === "manager") {
        return ["manager", "member"];
    }
    return [];
}

export function canInviterAssignInviteRole(inviterBusinessRole: string, inviteRole: string): boolean {
    const want = String(inviteRole || "").toLowerCase() as InviteRole;
    return inviteRolesAssignableByInviter(inviterBusinessRole).includes(want);
}

export function canManageBusinessTeam(role: string): boolean {
    return role === "owner" || role === "admin" || role === "manager";
}

export function isElevatedBusinessRole(role: string): boolean {
    return role === "owner" || role === "admin";
}
