"use client";

import { MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { canManageBusinessTeam } from "@/lib/team/business-team";
import type { TeamTableMember } from "./team-table-types";
import {
    teamTableCanOpenActionsMenu,
    teamTableShowManagerRoleItems,
    teamTableShowOwnerAdminRoleItems,
} from "./team-table-permissions";

interface TeamTableMemberActionsMenuProps {
    member: TeamTableMember;
    currentUserId: string;
    currentUserRole: string;
    isLoadingId: string | null;
    onRoleChange: (memberId: string, role: string) => void;
    onResendInvite: (inviteId: string) => void;
    onRemove: (memberId: string, type: "member" | "invite") => void;
}

export function TeamTableMemberActionsMenu({
    member,
    currentUserId,
    currentUserRole,
    isLoadingId,
    onRoleChange,
    onResendInvite,
    onRemove,
}: TeamTableMemberActionsMenuProps) {
    const canManage = canManageBusinessTeam(currentUserRole);
    const canOpen = teamTableCanOpenActionsMenu(member, currentUserId, currentUserRole);
    const showOwnerAdminRoleItems = teamTableShowOwnerAdminRoleItems(member, currentUserRole);
    const showManagerRoleItems = teamTableShowManagerRoleItems(member, currentUserRole);

    if (!canOpen) {
        return canManage ? (
            <span className="text-xs text-muted-foreground">—</span>
        ) : (
            <span className="text-xs text-muted-foreground">View only</span>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 size-8" disabled={isLoadingId === member.id}>
                    <span className="sr-only">Open menu</span>
                    {isLoadingId === member.id ? (
                        <Loader2 className="animate-spin size-4" />
                    ) : (
                        <MoreHorizontal className="size-4" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {member.type === "invite" && (
                    <DropdownMenuItem onClick={() => onResendInvite(member.id)}>Resend email</DropdownMenuItem>
                )}
                {member.type === "invite" && <DropdownMenuSeparator />}
                {showOwnerAdminRoleItems && (
                    <>
                        <DropdownMenuItem onClick={() => onRoleChange(member.id, "admin")}>Make Admin</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRoleChange(member.id, "manager")}>
                            Make Manager
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRoleChange(member.id, "member")}>
                            Make Member
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRoleChange(member.id, "viewer")}>
                            Make Viewer
                        </DropdownMenuItem>
                    </>
                )}
                {showManagerRoleItems && (
                    <>
                        <DropdownMenuItem onClick={() => onRoleChange(member.id, "manager")}>
                            Make Manager
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRoleChange(member.id, "member")}>
                            Make Member
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRoleChange(member.id, "viewer")}>
                            Make Viewer
                        </DropdownMenuItem>
                    </>
                )}
                {(showOwnerAdminRoleItems || showManagerRoleItems) && <DropdownMenuSeparator />}
                <DropdownMenuItem className="text-destructive" onClick={() => onRemove(member.id, member.type)}>
                    Remove
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
