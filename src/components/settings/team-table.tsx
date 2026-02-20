
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
import { MoreHorizontal, Trash2, Loader2 } from "lucide-react";
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

export interface Member {
    id: string; // member id
    role: string;
    type: "member" | "invite";
    scope: "org" | "store";
    user?: {
        full_name: string;
        email: string;
        avatar_url?: string;
    };
    email?: string; // For invites
    status: "active" | "invited" | "suspended";
    business_name?: string; // For store scope
}

interface TeamTableProps {
    members: Member[];
    currentUserId: string;
    currentUserRole: string;
}

export function TeamTable({ members, currentUserId, currentUserRole }: TeamTableProps) {
    const router = useRouter();
    const [isLoadingId, setIsLoadingId] = useState<string | null>(null);

    const canManageOrg = ["ORG_OWNER", "ORG_MANAGER"].includes(currentUserRole);
    // Store owners can manage their store employees? Not implemented in UI logic yet, assuming Org Admin manages for now.

    const handleRoleChange = async (member: Member, newRole: string) => {
        setIsLoadingId(member.id);
        try {
            const response = await fetch(`/api/team/${member.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole, type: member.scope }),
            });

            if (!response.ok) throw new Error("Failed to update role");
            toast.success("Role updated");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoadingId(null);
        }
    };

    const handleRemove = async (member: Member) => {
        if (!confirm("Are you sure you want to remove this member?")) return;
        setIsLoadingId(member.id);
        try {
            const response = await fetch(`/api/team/${member.id}?type=${member.type}&scope=${member.scope}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to remove member");
            toast.success("Member removed");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
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

    const getRoleBadgeColor = (role: string) => {
        if (role.includes("OWNER")) return "default";
        if (role.includes("MANAGER")) return "secondary";
        return "outline";
    };

    const formatRole = (role: string) => {
        return role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Scope</TableHead>
                         <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.map((member) => (
                        <TableRow key={`${member.scope}-${member.id}`}>
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
                                <div className="flex flex-col">
                                    <Badge variant="outline" className="w-fit">
                                        {member.scope === "org" ? "Organization" : "Store"}
                                    </Badge>
                                    {member.business_name && (
                                         <span className="text-xs text-muted-foreground mt-1">{member.business_name}</span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={getRoleBadgeColor(member.role) as any}>
                                    {formatRole(member.role)}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={member.status === "active" ? "default" : "secondary"} className={member.status === "active" ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"}>
                                    {member.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {canManageOrg ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoadingId === member.id}>
                                                <span className="sr-only">Open menu</span>
                                                {isLoadingId === member.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            {member.type === "member" && (
                                                member.scope === "org" ? (
                                                    <>
                                                        <DropdownMenuItem onClick={() => handleRoleChange(member, "ORG_MANAGER")}>Make Manager</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleRoleChange(member, "ORG_EMPLOYEE")}>Make Employee</DropdownMenuItem>
                                                    </>
                                                ) : (
                                                    <>
                                                        <DropdownMenuItem onClick={() => handleRoleChange(member, "STORE_MANAGER")}>Make Manager</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleRoleChange(member, "STORE_EMPLOYEE")}>Make Employee</DropdownMenuItem>
                                                    </>
                                                )
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleRemove(member)}>
                                                Remove
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <span className="text-muted-foreground text-xs">View only</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
