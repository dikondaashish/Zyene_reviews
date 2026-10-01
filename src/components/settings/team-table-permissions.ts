import { canManageBusinessTeam, isElevatedBusinessRole } from "@/lib/team/business-team";
import type { TeamTableMember } from "./team-table-types";

export function teamTableCanOpenActionsMenu(
    member: TeamTableMember,
    currentUserId: string,
    currentUserRole: string,
    canDeleteDeveloper = false,
): boolean {
    const canManage = canManageBusinessTeam(currentUserRole);
    if (!canManage) return false;
    if (member.type === "invite") return true;
    if (member.userId === currentUserId) return false;
    if (member.roleLabel === "developer") return canDeleteDeveloper;
    if (currentUserRole === "manager" && isElevatedBusinessRole(member.role)) return false;
    if (currentUserRole === "admin" && member.role === "owner") return false;
    return true;
}

export function teamTableShowOwnerAdminRoleItems(member: TeamTableMember, currentUserRole: string) {
    return member.roleLabel !== "developer" && member.type === "member" && (currentUserRole === "owner" || currentUserRole === "admin");
}

export function teamTableShowManagerRoleItems(member: TeamTableMember, currentUserRole: string) {
    return member.type === "member" && currentUserRole === "manager";
}
