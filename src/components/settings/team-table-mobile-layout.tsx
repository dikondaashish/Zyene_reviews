"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { TeamTableMember } from "./team-table-types";
import { teamTableMemberInitials, teamTableRoleBadgeVariant } from "./team-table-utils";
import { TeamTableMemberActionsMenu } from "./team-table-member-actions-menu";

interface TeamTableMobileLayoutProps {
    members: TeamTableMember[];
    currentUserId: string;
    currentUserRole: string;
    isLoadingId: string | null;
    onRoleChange: (memberId: string, role: string) => void;
    onResendInvite: (inviteId: string) => void;
    onRemove: (memberId: string, type: "member" | "invite") => void;
}

export function TeamTableMobileLayout(props: TeamTableMobileLayoutProps) {
    const { members, currentUserId, currentUserRole, isLoadingId, onRoleChange, onResendInvite, onRemove } = props;

    return (
        <div className="space-y-3 lg:hidden">
            {members.map((member) => (
                <div
                    key={member.id}
                    className="flex min-w-0 items-start gap-3 rounded-xl border border-border bg-card p-4"
                >
                    <Avatar className="shrink-0 size-10">
                        <AvatarImage src={member.user?.avatar_url} />
                        <AvatarFallback>
                            {member.type === "member" ? teamTableMemberInitials(member.user?.full_name || "") : "?"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="break-words text-sm font-medium">
                                    {member.type === "member" ? member.user?.full_name : "Invited Member"}
                                </p>
                                <p className="break-all text-xs text-muted-foreground">
                                    {member.type === "member" ? member.user?.email : member.email}
                                </p>
                            </div>
                            <TeamTableMemberActionsMenu
                                member={member}
                                currentUserId={currentUserId}
                                currentUserRole={currentUserRole}
                                isLoadingId={isLoadingId}
                                onRoleChange={onRoleChange}
                                onResendInvite={onResendInvite}
                                onRemove={onRemove}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant={teamTableRoleBadgeVariant(member.role)} className="capitalize">
                                {member.role}
                            </Badge>
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
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
