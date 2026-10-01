"use client";

import type { TeamTableProps } from "./team-table-types";
import { useTeamTableActions } from "./use-team-table-actions";
import { TeamTableMobileLayout } from "./team-table-mobile-layout";
import { TeamTableDesktopTable } from "./team-table-desktop-table";

export function TeamTable({ members, currentUserId, currentUserRole, canDeleteDeveloper }: TeamTableProps) {
    const a = useTeamTableActions(members);

    return (
        <div className="min-w-0">
            <TeamTableMobileLayout
                members={members}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                canDeleteDeveloper={canDeleteDeveloper}
                isLoadingId={a.isLoadingId}
                onRoleChange={a.handleRoleChange}
                onResendInvite={a.handleResendInvite}
                onRemove={a.handleRemove}
            />
            <TeamTableDesktopTable
                members={members}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                canDeleteDeveloper={canDeleteDeveloper}
                isLoadingId={a.isLoadingId}
                onRoleChange={a.handleRoleChange}
                onResendInvite={a.handleResendInvite}
                onRemove={a.handleRemove}
            />
        </div>
    );
}
