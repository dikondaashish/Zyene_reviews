
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

interface Member {
    id: string;
    role: string;
    type: "member" | "invite";
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

    const canManage = ["owner", "admin"].includes(currentUserRole);

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
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoadingId(null);
        }
    };

    const handleRemove = async (memberId: string, type: "member" | "invite") => {
        if (!confirm("Are you sure you want to remove this member?")) return;
        setIsLoadingId(memberId);
        try {
            const response = await fetch(`/api/team/${memberId}?type=${type}`, {
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
        switch (role) {
            case "owner": return "default"; // purple-ish usually default primary
            case "admin": return "secondary"; // blue-ish
            default: return "outline"; // gray
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
                    {members.map((member) => (
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
                                <Badge variant={getRoleBadgeColor(member.role) as any} className="capitalize">
                                    {member.role}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={member.status === "active" ? "default" : "secondary"} className={member.status === "active" ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600"}>
                                    {member.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {canManage ? (
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
                                                <>
                                                    <DropdownMenuItem onClick={() => handleRoleChange(member.id, "admin")}>Make Admin</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleRoleChange(member.id, "member")}>Make Member</DropdownMenuItem>
                                                </>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleRemove(member.id, member.type)}>
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
