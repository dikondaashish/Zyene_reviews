"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { teamTableResendInviteWithToasts } from "./team-table-invite-resend";

import type { TeamTableMember } from "@/components/settings/team-table-types";

export function useTeamTableActions(members: TeamTableMember[]) {
    const router = useRouter();
    const [isLoadingId, setIsLoadingId] = useState<string | null>(null);

    const handleRoleChange = useCallback(async (memberId: string, newRole: string) => {
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
    }, [router]);

    const handleResendInvite = useCallback(
        async (inviteId: string) => {
            setIsLoadingId(inviteId);
            try {
                await teamTableResendInviteWithToasts(inviteId);
                router.refresh();
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "An unexpected error occurred";
                toast.error(message);
            } finally {
                setIsLoadingId(null);
            }
        },
        [router],
    );

    const handleRemove = useCallback(
        async (memberId: string, type: "member" | "invite") => {
            const isDeveloper = members.some((m) => m.id === memberId && m.roleLabel === "developer");
            const msg =
                type === "invite"
                    ? "Cancel this invitation? They will not be able to use the old link after you remove it."
                    : isDeveloper
                      ? "Delete Developer? This removes their access to this organization and all its businesses. Their other organizations are unchanged."
                      : "Are you sure you want to remove this member?";
            if (!confirm(msg)) return;
            const successMessage = isDeveloper ? "Developer removed from organization" : "Member removed";
            setIsLoadingId(memberId);
            try {
                const response = await fetch(`/api/team/${memberId}?type=${type}`, {
                    method: "DELETE",
                });

                if (!response.ok) throw new Error("Failed to remove member");
                toast.success(successMessage);
                router.refresh();
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "An unexpected error occurred";
                toast.error(message);
            }
            setIsLoadingId(null);
        },
        [router, members],
    );

    return { isLoadingId, handleRoleChange, handleResendInvite, handleRemove };
}
