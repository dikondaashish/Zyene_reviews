"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { inviteRolesAssignableByInviter, type InviteRole } from "@/lib/team/business-team";
import {
    inviteRoleLabel,
    parseInviteErrorMessage,
    parseInviteResponsePayload,
} from "./invite-member-dialog-utils";

export type InviteMemberDialogProps = {
    inviterRole: string;
    triggerLabel?: string;
    triggerClassName?: string;
    triggerVariant?: "default" | "outline" | "secondary" | "ghost";
    showPlusIcon?: boolean;
    autoCopyInviteLink?: boolean;
};

export function useInviteMemberDialog(inviterRole: string, autoCopyInviteLink = false) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const assignableRoles = inviteRolesAssignableByInviter(inviterRole);

    useEffect(() => {
        if (assignableRoles.length === 0) return;
        if (!assignableRoles.includes(role as InviteRole)) {
            setRole(assignableRoles[0] ?? "member");
        }
    }, [assignableRoles, role]);

    const handleInvite = async () => {
        const trimmed = email.trim();
        if (!trimmed) {
            toast.error("Enter an email address");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/team/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: trimmed, role }),
            });

            let payload: unknown;
            try {
                payload = await response.json();
            } catch {
                throw new Error("Invalid response from server");
            }

            if (!response.ok) {
                throw new Error(parseInviteErrorMessage(payload, "Failed to invite member"));
            }

            const data = parseInviteResponsePayload(payload);
            const link = typeof data?.invite_link === "string" ? data.invite_link : null;

            const copyLink = () => {
                if (link && typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                    void navigator.clipboard.writeText(link);
                }
            };

            if (autoCopyInviteLink && link) {
                copyLink();
            }

            if (data?.email_delivered === false) {
                toast.warning("Invite saved, but email was not sent from our server.", {
                    description:
                        typeof data.email_delivery_error === "string"
                            ? data.email_delivery_error
                            : "Check Vercel env: RESEND_API_KEY and RESEND_FROM (verified domain).",
                    duration: 12_000,
                    action: link ? { label: "Copy invite link", onClick: copyLink } : undefined,
                });
                if (link) copyLink();
            } else if (data?.email_delivered === true) {
                toast.success(`Invitation email queued for ${trimmed}`, {
                    description:
                        "If they don’t see it within a few minutes, ask them to check spam or Promotions. You can also copy the link as a backup.",
                    duration: 10_000,
                    action: link ? { label: "Copy invite link", onClick: copyLink } : undefined,
                });
            } else {
                toast.message("Invite saved", {
                    description:
                        "We could not confirm email delivery. Copy the link and send it to your colleague if they don’t receive an email.",
                    duration: 10_000,
                    action: link ? { label: "Copy invite link", onClick: copyLink } : undefined,
                });
            }

            setOpen(false);
            setEmail("");
            setRole(assignableRoles[0] ?? "member");
            router.refresh();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        open,
        setOpen,
        email,
        setEmail,
        role,
        setRole,
        isLoading,
        assignableRoles,
        handleInvite,
        inviteRoleLabel,
    };
}
