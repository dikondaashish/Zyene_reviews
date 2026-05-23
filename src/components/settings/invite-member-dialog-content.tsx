"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { InviteRole } from "@/lib/team/business-team";

export function InviteMemberDialogContent({
    email,
    onEmailChange,
    role,
    onRoleChange,
    assignableRoles,
    inviteRoleLabel,
    isLoading,
    onInvite,
}: {
    email: string;
    onEmailChange: (value: string) => void;
    role: string;
    onRoleChange: (value: string) => void;
    assignableRoles: InviteRole[];
    inviteRoleLabel: (role: InviteRole) => string;
    isLoading: boolean;
    onInvite: () => void;
}) {
    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Invite Member</DialogTitle>
                <DialogDescription>
                    Invite a new member to this business team. They will receive an email to join.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-4 sm:gap-4">
                    <Label htmlFor="email" className="text-left sm:text-right">
                        Email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => onEmailChange(e.target.value)}
                        className="sm:col-span-3"
                        placeholder="colleague@example.com"
                    />
                </div>
                <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-4 sm:gap-4">
                    <Label htmlFor="role" className="text-left sm:text-right">
                        Role
                    </Label>
                    <Select value={role} onValueChange={onRoleChange}>
                        <SelectTrigger className="sm:col-span-3">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            {assignableRoles.map((r) => (
                                <SelectItem key={r} value={r}>
                                    {inviteRoleLabel(r)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button type="button" onClick={onInvite} disabled={isLoading || !email.trim()}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Invite
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
