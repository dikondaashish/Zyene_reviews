
"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { inviteRolesAssignableByInviter, type InviteRole } from "@/lib/team/business-team";
import { cn } from "@/lib/utils";

function inviteRoleLabel(role: InviteRole) {
    return role.charAt(0).toUpperCase() + role.slice(1);
}

export function InviteMemberDialog({
    inviterRole,
    triggerLabel = "Invite Member",
    triggerClassName,
    triggerVariant = "default",
    showPlusIcon = true,
    autoCopyInviteLink = false,
}: {
    /** Current user's `business_members.role` for this business (drives which invite roles appear). */
    inviterRole: string;
    triggerLabel?: string;
    triggerClassName?: string;
    triggerVariant?: "default" | "outline" | "secondary" | "ghost";
    showPlusIcon?: boolean;
    autoCopyInviteLink?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const assignableRoles = useMemo(() => inviteRolesAssignableByInviter(inviterRole), [inviterRole]);

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
                const err =
                    typeof payload === "object" &&
                    payload !== null &&
                    "error" in payload &&
                    typeof (payload as { error: unknown }).error === "string"
                        ? (payload as { error: string }).error
                        : "Failed to invite member";
                throw new Error(err);
            }

            const data =
                typeof payload === "object" &&
                payload !== null &&
                "data" in payload &&
                typeof (payload as { data: unknown }).data === "object" &&
                (payload as { data: unknown }).data !== null
                    ? ((payload as { data: Record<string, unknown> }).data)
                    : null;

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
                toast.success(`Invitation email queued for ${trimmed}`, {
                    description:
                        "If they don’t see it within a few minutes, ask them to check spam or Promotions. You can also copy the link as a backup.",
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
                toast.message("Invite saved", {
                    description:
                        "We could not confirm email delivery. Copy the link and send it to your colleague if they don’t receive an email.",
                    duration: 10_000,
                    action:
                        link ?
                            {
                                label: "Copy invite link",
                                onClick: copyLink,
                            }
                        :   undefined,
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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={triggerVariant} className={cn(triggerClassName)}>
                    {showPlusIcon ? <Plus className="mr-2 h-4 w-4" /> : null}
                    {triggerLabel}
                </Button>
            </DialogTrigger>
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
                            onChange={(e) => setEmail(e.target.value)}
                            className="sm:col-span-3"
                            placeholder="colleague@example.com"
                        />
                    </div>
                    <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-4 sm:gap-4">
                        <Label htmlFor="role" className="text-left sm:text-right">
                            Role
                        </Label>
                        <Select value={role} onValueChange={setRole}>
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
                    <Button type="button" onClick={handleInvite} disabled={isLoading || !email.trim()}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Invite
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
