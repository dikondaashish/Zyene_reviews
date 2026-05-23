"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { InviteMemberDialog } from "@/components/settings/invite-member-dialog";

export function TeamManagementPanelHeader({
    businessName,
    canInviteTeam,
    currentUserRole,
    latestInviteLink,
    latestInviteEmail,
}: {
    businessName: string;
    canInviteTeam: boolean;
    currentUserRole: string;
    latestInviteLink: string | null;
    latestInviteEmail: string | null;
}) {
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <h3 className="text-3xl font-semibold tracking-tight">Team</h3>
                <p className="text-sm text-muted-foreground">{businessName} · Manage members and permissions</p>
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
    );
}
