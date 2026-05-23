"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { InviteMemberDialogContent } from "./invite-member-dialog-content";
import type { InviteMemberDialogProps } from "./use-invite-member-dialog";
import { useInviteMemberDialog } from "./use-invite-member-dialog";

export function InviteMemberDialog({
    inviterRole,
    triggerLabel = "Invite Member",
    triggerClassName,
    triggerVariant = "default",
    showPlusIcon = true,
    autoCopyInviteLink = false,
}: InviteMemberDialogProps) {
    const d = useInviteMemberDialog(inviterRole, autoCopyInviteLink);

    return (
        <Dialog open={d.open} onOpenChange={d.setOpen}>
            <DialogTrigger asChild>
                <Button variant={triggerVariant} className={cn(triggerClassName)}>
                    {showPlusIcon ? <Plus className="mr-2 size-4" /> : null}
                    {triggerLabel}
                </Button>
            </DialogTrigger>
            <InviteMemberDialogContent
                email={d.email}
                onEmailChange={d.setEmail}
                role={d.role}
                onRoleChange={d.setRole}
                assignableRoles={d.assignableRoles}
                inviteRoleLabel={d.inviteRoleLabel}
                isLoading={d.isLoading}
                onInvite={d.handleInvite}
            />
        </Dialog>
    );
}
