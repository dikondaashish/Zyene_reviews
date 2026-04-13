/** Roles stored on `business_members.role` (matches DB CHECK). */
export const BUSINESS_MEMBER_ROLES = ["owner", "admin", "manager", "member", "viewer"] as const;
export type BusinessMemberRole = (typeof BUSINESS_MEMBER_ROLES)[number];

/** Roles allowed on `invitations.role` (matches DB CHECK). */
export const INVITE_ROLE_VALUES = ["admin", "manager", "member", "viewer"] as const;
export type InviteRole = (typeof INVITE_ROLE_VALUES)[number];

export function canManageBusinessTeam(role: string): boolean {
    return role === "owner" || role === "admin" || role === "manager";
}

export function isElevatedBusinessRole(role: string): boolean {
    return role === "owner" || role === "admin";
}
