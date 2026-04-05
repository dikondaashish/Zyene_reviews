"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
}

export function DeleteBusinessButton({
    businessId,
    businessName,
    disabled = false,
}: DeleteBusinessButtonProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [confirmName, setConfirmName] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const canDelete = confirmName.trim() === businessName;

    const handleDelete = async () => {
        if (!canDelete || isDeleting) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/businesses/${businessId}`, { method: "DELETE" });
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast.error("Failed to delete business", {
                    description: (payload as any)?.error || "Please try again.",
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
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    className="h-7 px-2 border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
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
                    <p className="text-xs text-muted-foreground">
                        Type: <span className="font-medium text-foreground">{businessName}</span>
                    </p>
                    <Input
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
                        className="bg-red-600 hover:bg-red-700"
                        disabled={!canDelete || isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete business"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

