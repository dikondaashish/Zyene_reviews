"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiErrorResponse } from "@/types/components";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteBusinessButtonProps {
    businessId: string;
    businessName: string;
    disabled?: boolean;
    compact?: boolean;
}

export function DeleteBusinessButton({
    businessId,
    businessName,
    disabled = false,
    compact = false,
}: DeleteBusinessButtonProps) {
    const router = useRouter();
    const confirmId = useId();
    const [open, setOpen] = useState(false);
    const [confirmName, setConfirmName] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const canDelete = confirmName.trim() === businessName;

    const handleDelete = async () => {
        if (!canDelete || isDeleting) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/businesses/${businessId}`, { method: "DELETE" });
            const payload = (await res.json().catch(() => ({}))) as ApiErrorResponse;
            if (!res.ok) {
                toast.error("Failed to delete business", {
                    description: payload.error || "Please try again.",
                });
                return;
            }
            toast.success("Business deleted");
            setOpen(false);
            setConfirmName("");
            router.refresh();
        } catch (e: unknown) {
            toast.error("Failed to delete business", { description: e instanceof Error ? e.message : "Please try again." });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={(nextOpen) => {
            if (isDeleting) return;
            setOpen(nextOpen);
            setConfirmName("");
        }}>
            <AlertDialogTrigger asChild>
                <Button
                    type="button"
                    variant={compact ? "ghost" : "outline"}
                    size={compact ? "icon" : "sm"}
                    disabled={disabled}
                    aria-label={`Delete ${businessName}`}
                    title={disabled ? "Keep at least one business in your workspace" : `Delete ${businessName}`}
                    className={compact ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive" : "h-7 px-2 border-destructive/30 text-destructive hover:text-destructive hover:bg-destructive/10"}
                >
                    <Trash2 className="size-3.5" />
                    {!compact && "Delete"}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete this business?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will remove this business from your workspace view. To confirm, type the business name exactly.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2">
                    <label htmlFor={confirmId} className="text-xs text-muted-foreground">
                        Type: <span className="font-medium text-foreground">{businessName}</span>
                    </label>
                    <Input
                        id={confirmId}
                        value={confirmName}
                        onChange={(e) => setConfirmName(e.target.value)}
                        placeholder="Enter business name"
                    />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            void handleDelete();
                        }}
                        className="bg-destructive hover:bg-destructive/90"
                        disabled={!canDelete || isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete business"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

