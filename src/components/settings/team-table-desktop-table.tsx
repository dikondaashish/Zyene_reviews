"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { TeamTableMember } from "./team-table-types";
import { teamTableMemberInitials, teamTableRoleBadgeVariant } from "./team-table-utils";
import { TeamTableMemberActionsMenu } from "./team-table-member-actions-menu";

interface TeamTableDesktopTableProps {
    members: TeamTableMember[];
    currentUserId: string;
    currentUserRole: string;
    isLoadingId: string | null;
    onRoleChange: (memberId: string, role: string) => void;
    onResendInvite: (inviteId: string) => void;
    onRemove: (memberId: string, type: "member" | "invite") => void;
}

export function TeamTableDesktopTable(props: TeamTableDesktopTableProps) {
    const { members, currentUserId, currentUserRole, isLoadingId, onRoleChange, onResendInvite, onRemove } = props;

    return (
        <div className="hidden rounded-md border lg:block">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.map((member) => (
                        <TableRow key={member.id}>
                            <TableCell className="flex items-center gap-3">
                                <Avatar className="size-9">
                                    <AvatarImage src={member.user?.avatar_url} />
                                    <AvatarFallback>
                                        {member.type === "member"
                                            ? teamTableMemberInitials(member.user?.full_name || "")
                                            : "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm">
                                        {member.type === "member" ? member.user?.full_name : "Invited Member"}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {member.type === "member" ? member.user?.email : member.email}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={teamTableRoleBadgeVariant(member.role)} className="capitalize">
                                    {member.role}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={member.status === "active" ? "default" : "secondary"}
                                    className={
                                        member.status === "active"
                                            ? "bg-chart-2 hover:bg-chart-2/90"
                                            : "bg-chart-4 hover:bg-chart-4/90"
                                    }
                                >
                                    {member.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <TeamTableMemberActionsMenu
                                    member={member}
                                    currentUserId={currentUserId}
                                    currentUserRole={currentUserRole}
                                    isLoadingId={isLoadingId}
                                    onRoleChange={onRoleChange}
                                    onResendInvite={onResendInvite}
                                    onRemove={onRemove}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
