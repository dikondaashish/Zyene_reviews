"use client";

import { formatDistanceToNow } from "date-fns";
import { Check, Minus, Copy } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { InviteMemberDialog } from "@/components/settings/invite-member-dialog";
import { TeamTable } from "@/components/settings/team-table";

type TeamMemberRow = {
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

type ActivityRow = {
    id: string;
    message: string;
    createdAt: string;
};

const PERMISSION_ROWS = [
    { action: "Invite members", owner: true, admin: true, manager: true, member: false, viewer: false },
    { action: "Remove members", owner: true, admin: true, manager: false, member: false, viewer: false },
    { action: "Change roles", owner: true, admin: true, manager: false, member: false, viewer: false },
    { action: "Edit business settings", owner: true, admin: true, manager: false, member: false, viewer: false },
    { action: "Manage menus & orders", owner: true, admin: true, manager: true, member: true, viewer: false },
    { action: "View reports", owner: true, admin: true, manager: true, member: true, viewer: true },
    { action: "Export data", owner: true, admin: true, manager: true, member: false, viewer: false },
    { action: "Billing & plan", owner: true, admin: false, manager: false, member: false, viewer: false },
    { action: "Delete business", owner: true, admin: false, manager: false, member: false, viewer: false },
] as const;

export function TeamManagementPanel({
    businessName,
    canInviteTeam,
    members,
    currentUserId,
    currentUserRole,
    activeMembersCount,
    pendingInvitesCount,
    maxMembers,
    latestInviteLink,
    latestInviteEmail,
    activity,
}: {
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
    activity: ActivityRow[];
}) {
    const seatsUsed = activeMembersCount + pendingInvitesCount;
    const seatPercent = !maxMembers || maxMembers <= 0
        ? 0
        : Math.min(100, Math.round((seatsUsed / maxMembers) * 100));

    const copyLatestInviteLink = async () => {
        if (!latestInviteLink) {
            toast.message("No pending invite link yet", {
                description: "Send an invite first, then you can copy that invite link.",
            });
            return;
        }
        try {
            await navigator.clipboard.writeText(latestInviteLink);
            toast.success("Invite link copied", {
                description: latestInviteEmail
                    ? `Latest pending invite: ${latestInviteEmail}`
                    : "You can share this link with the invited teammate.",
            });
        } catch {
            toast.error("Could not copy invite link");
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h3 className="text-3xl font-semibold tracking-tight">Team</h3>
                    <p className="text-sm text-muted-foreground">
                        {businessName} · Manage members and permissions
                    </p>
                </div>
                {canInviteTeam ? (
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" onClick={() => void copyLatestInviteLink()}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy invite link
                        </Button>
                        <InviteMemberDialog inviterRole={currentUserRole} triggerLabel="Invite members" />
                    </div>
                ) : null}
            </div>

            {maxMembers === -1 ? (
                <div className="rounded-xl border border-border/80 bg-card px-4 py-3">
                    <p className="text-base font-semibold">Unlimited seats on your Enterprise plan</p>
                </div>
            ) : maxMembers > 0 ? (
                <div className="rounded-xl border border-border/80 bg-card px-4 py-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                        <p className="text-base font-semibold">
                            {seatsUsed} / {maxMembers} seats used
                        </p>
                        <Progress value={seatPercent} className="h-2.5 flex-1 bg-muted" />
                        {seatsUsed >= maxMembers ? (
                            <Link
                                href="/settings/billing"
                                className="text-sm font-medium text-primary underline underline-offset-2 hover:brightness-90"
                            >
                                Need more? Upgrade plan
                            </Link>
                        ) : null}
                    </div>
                </div>
            ) : null}

            <Tabs defaultValue="members">
                <TabsList variant="line" className="w-full justify-start border-b border-border">
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="permission-matrix">Permission matrix</TabsTrigger>
                    <TabsTrigger value="activity-log">Activity log</TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="pt-4">
                    <TeamTable
                        members={members}
                        currentUserId={currentUserId}
                        currentUserRole={currentUserRole}
                    />
                </TabsContent>

                <TabsContent value="permission-matrix" className="pt-4">
                    <div className="overflow-x-auto rounded-lg border border-border bg-card">
                        <table className="w-full min-w-[720px] text-sm">
                            <thead className="border-b border-border bg-muted/40">
                                <tr className="text-left">
                                    <th className="px-4 py-3 font-semibold">Action</th>
                                    <th className="px-4 py-3 text-center font-semibold">Owner</th>
                                    <th className="px-4 py-3 text-center font-semibold">Admin</th>
                                    <th className="px-4 py-3 text-center font-semibold">Manager</th>
                                    <th className="px-4 py-3 text-center font-semibold">Member</th>
                                    <th className="px-4 py-3 text-center font-semibold">Viewer</th>
                                </tr>
                            </thead>
                            <tbody>
                                {PERMISSION_ROWS.map((row) => (
                                    <tr key={row.action} className="border-b border-border/60 last:border-b-0">
                                        <td className="px-4 py-3 font-medium text-foreground/90">{row.action}</td>
                                        {(["owner", "admin", "manager", "member", "viewer"] as const).map((role) => (
                                            <td key={role} className="px-4 py-3 text-center">
                                                {row[role] ? (
                                                    <Check className="mx-auto h-4 w-4 text-chart-2" />
                                                ) : (
                                                    <Minus className="mx-auto h-4 w-4 text-muted-foreground/80" />
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                <TabsContent value="activity-log" className="pt-4">
                    <div className="rounded-lg border border-border bg-card">
                        {activity.length === 0 ? (
                            <div className="px-4 py-8 text-sm text-muted-foreground">
                                No recent team activity yet.
                            </div>
                        ) : (
                            <ul className="divide-y divide-border/70">
                                {activity.map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex items-start justify-between gap-4 px-4 py-3 text-sm"
                                    >
                                        <div className="flex min-w-0 items-start gap-2">
                                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                                            <p className="text-foreground/90">{item.message}</p>
                                        </div>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
            <Separator />
        </div>
    );
}
