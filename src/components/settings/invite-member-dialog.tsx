
"use client";

import { useState } from "react";
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
import { INVITE_ROLE_VALUES } from "@/lib/team/business-team";

function inviteRoleLabel(role: (typeof INVITE_ROLE_VALUES)[number]) {
    return role.charAt(0).toUpperCase() + role.slice(1);
}

export function InviteMemberDialog() {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

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

            if (data && data.email_delivered === false) {
                const link = typeof data.invite_link === "string" ? data.invite_link : null;
                toast.warning(
                    link
                        ? "Invite saved, but the email could not be sent. Copy the link and share it manually."
                        : "Invite saved, but the email could not be sent. Check Resend configuration or try again.",
                    { duration: 8000 }
                );
                if (link && typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                    try {
                        await navigator.clipboard.writeText(link);
                        toast.message("Invite link copied to clipboard");
                    } catch {
                        /* clipboard optional */
                    }
                }
            } else {
                toast.success("Invitation sent");
            }

            setOpen(false);
            setEmail("");
            setRole("member");
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
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Invite Member
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>Invite Member</DialogTitle>
                    <DialogDescription>
                        Invite a new member to this business team. They will receive an email to join.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="col-span-3"
                            placeholder="colleague@example.com"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                            Role
                        </Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {INVITE_ROLE_VALUES.map((r) => (
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
