"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { TeamTable } from "@/components/settings/team-table";
import { TeamManagementPanelActivityLog } from "./team-management-panel-activity-log";
import { TeamManagementPanelHeader } from "./team-management-panel-header";
import { TeamManagementPanelPermissionMatrix } from "./team-management-panel-permission-matrix";
import { TeamManagementPanelSeatsBanner } from "./team-management-panel-seats-banner";
import type { TeamManagementPanelProps } from "./team-management-panel-types";

export function TeamManagementPanel(props: TeamManagementPanelProps) {
    const seatsUsed = props.activeMembersCount + props.pendingInvitesCount;
    const seatPercent =
        !props.maxMembers || props.maxMembers <= 0
            ? 0
            : Math.min(100, Math.round((seatsUsed / props.maxMembers) * 100));

    return (
        <div className="space-y-5">
            <TeamManagementPanelHeader
                businessName={props.businessName}
                canInviteTeam={props.canInviteTeam}
                currentUserRole={props.currentUserRole}
                latestInviteLink={props.latestInviteLink}
                latestInviteEmail={props.latestInviteEmail}
            />

            <TeamManagementPanelSeatsBanner
                seatsUsed={seatsUsed}
                maxMembers={props.maxMembers}
                seatPercent={seatPercent}
            />

            <Tabs defaultValue="members">
                <TabsList variant="line" className="w-full justify-start border-b border-border">
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="permission-matrix">Permission matrix</TabsTrigger>
                    <TabsTrigger value="activity-log">Activity log</TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="pt-4">
                    <TeamTable
                        members={props.members}
                        currentUserId={props.currentUserId}
                        currentUserRole={props.currentUserRole}
                    />
                </TabsContent>

                <TabsContent value="permission-matrix" className="pt-4">
                    <TeamManagementPanelPermissionMatrix />
                </TabsContent>

                <TabsContent value="activity-log" className="pt-4">
                    <TeamManagementPanelActivityLog activity={props.activity} />
                </TabsContent>
            </Tabs>
            <Separator />
        </div>
    );
}
