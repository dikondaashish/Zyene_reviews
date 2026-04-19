
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
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { TeamRoleBadgeVariant } from "@/types/components";
import { canManageBusinessTeam, isElevatedBusinessRole } from "@/lib/team/business-team";

interface Member {
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
    email?: string; // For invites
    status: "active" | "invited";
}

interface TeamTableProps {
    members: Member[];
    currentUserId: string;
    currentUserRole: string;
}

export function TeamTable({ members, currentUserId, currentUserRole }: TeamTableProps) {
    const router = useRouter();
    const [isLoadingId, setIsLoadingId] = useState<string | null>(null);

    const canManage = canManageBusinessTeam(currentUserRole);

    const canOpenActionsMenu = (member: Member) => {
        if (!canManage) return false;
        if (member.type === "invite") return true;
        if (member.userId === currentUserId) return false;
        if (currentUserRole === "manager" && isElevatedBusinessRole(member.role)) return false;
        if (currentUserRole === "admin" && member.role === "owner") return false;
        return true;
    };

    const handleRoleChange = async (memberId: string, newRole: string) => {
        setIsLoadingId(memberId);
        try {
            const response = await fetch(`/api/team/${memberId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });

            if (!response.ok) throw new Error("Failed to update role");
            toast.success("Role updated");
            router.refresh();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error(message);
        } finally {
            setIsLoadingId(null);
        }
    };

    const handleResendInvite = async (inviteId: string) => {
        setIsLoadingId(inviteId);
        try {
            const response = await fetch(`/api/team/invites/${inviteId}/resend`, { method: "POST" });
            let payload: unknown;
            try {
                payload = await response.json();
            } catch {
                throw new Error("Invalid response from server");
            }
            if (!response.ok) {
                const err =
                    typeof payload === "object" &&
                    payload !== null &&
                    "error" in payload &&
                    typeof (payload as { error: unknown }).error === "string"
                        ? (payload as { error: string }).error
                        : "Failed to resend invite email";
                throw new Error(err);
            }
            const data =
                typeof payload === "object" &&
                payload !== null &&
                "data" in payload &&
                typeof (payload as { data: unknown }).data === "object" &&
                (payload as { data: unknown }).data !== null
                    ? (payload as { data: Record<string, unknown> }).data
                    : null;

            const link = typeof data?.invite_link === "string" ? data.invite_link : null;
            const copyLink = () => {
                if (link && typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                    void navigator.clipboard.writeText(link);
                }
            };

            if (data?.email_delivered === false) {
                toast.warning("Invite expiry was renewed, but email was not sent from our server.", {
                    description:
                        typeof data.email_delivery_error === "string" ? data.email_delivery_error : undefined,
                    duration: 12_000,
                    action:
                        link ?
                            {
                                label: "Copy invite link",
                                onClick: copyLink,
                            }
                        :   undefined,
                });
                if (link) copyLink();
            } else if (data?.email_delivered === true) {
                toast.success("Invitation email sent again.", {
                    description:
                        "If they still do not see it, ask them to check spam. You can copy the link as a backup.",
                    duration: 10_000,
                    action:
                        link ?
                            {
                                label: "Copy invite link",
                                onClick: copyLink,
                            }
                        :   undefined,
                });
            } else {
                toast.message("Resend finished", {
                    description: "We could not confirm email delivery. Use Copy invite link if needed.",
                    duration: 9000,
                    action:
                        link ?
                            {
                                label: "Copy invite link",
                                onClick: copyLink,
                            }
                        :   undefined,
                });
            }
            router.refresh();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error(message);
        } finally {
            setIsLoadingId(null);
        }
    };

    const handleRemove = async (memberId: string, type: "member" | "invite") => {
        const msg =
            type === "invite" ?
                "Cancel this invitation? They will not be able to use the old link after you remove it."
            :   "Are you sure you want to remove this member?";
        if (!confirm(msg)) return;
        setIsLoadingId(memberId);
        try {
            const response = await fetch(`/api/team/${memberId}?type=${type}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to remove member");
            toast.success("Member removed");
            router.refresh();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error(message);
        } finally {
            setIsLoadingId(null);
        }
    };

    const getInitials = (name: string) => {
        return name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "?";
    };

    const getRoleBadgeColor = (role: string): TeamRoleBadgeVariant => {
        switch (role.toLowerCase()) {
            case "owner":
            case "org_owner":
                return "default"; // purple-ish
            case "admin":
            case "org_admin":
                return "secondary"; // blue-ish
            case "manager":
                return "secondary";
            default:
                return "outline"; // gray
        }
    };

    return (
        <div className="rounded-md border">
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
                    {members.map((member) => {
                        const showOwnerAdminRoleItems =
                            member.type === "member" &&
                            (currentUserRole === "owner" || currentUserRole === "admin");
                        const showManagerRoleItems = member.type === "member" && currentUserRole === "manager";

                        return (
                        <TableRow key={member.id}>
                            <TableCell className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={member.user?.avatar_url} />
                                    <AvatarFallback>
                                        {member.type === "member"
                                            ? getInitials(member.user?.full_name || "")
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
                                <Badge variant={getRoleBadgeColor(member.role)} className="capitalize">
                                    {member.role}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={member.status === "active" ? "default" : "secondary"} className={member.status === "active" ? "bg-chart-2 hover:bg-chart-2/90" : "bg-chart-4 hover:bg-chart-4/90"}>
                                    {member.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {canOpenActionsMenu(member) ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoadingId === member.id}>
                                                <span className="sr-only">Open menu</span>
                                                {isLoadingId === member.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            {member.type === "invite" && (
                                                <DropdownMenuItem onClick={() => handleResendInvite(member.id)}>
                                                    Resend email
                                                </DropdownMenuItem>
                                            )}
                                            {member.type === "invite" && <DropdownMenuSeparator />}
                                            {showOwnerAdminRoleItems && (
                                                <>
                                                    <DropdownMenuItem onClick={() => handleRoleChange(member.id, "admin")}>Make Admin</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleRoleChange(member.id, "manager")}>Make Manager</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleRoleChange(member.id, "member")}>Make Member</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleRoleChange(member.id, "viewer")}>Make Viewer</DropdownMenuItem>
                                                </>
                                            )}
                                            {showManagerRoleItems && (
                                                <>
                                                    <DropdownMenuItem onClick={() => handleRoleChange(member.id, "manager")}>Make Manager</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleRoleChange(member.id, "member")}>Make Member</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleRoleChange(member.id, "viewer")}>Make Viewer</DropdownMenuItem>
                                                </>
                                            )}
                                            {(showOwnerAdminRoleItems || showManagerRoleItems) && <DropdownMenuSeparator />}
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleRemove(member.id, member.type)}>
                                                Remove
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : canManage ? (
                                    <span className="text-muted-foreground text-xs">—</span>
                                ) : (
                                    <span className="text-muted-foreground text-xs">View only</span>
                                )}
                            </TableCell>
                        </TableRow>
                    );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
