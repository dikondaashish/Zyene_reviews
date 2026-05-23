"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
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

export function DeleteAccountSection() {
    const [open, setOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const isConfirmed = confirmText === "confirm delete";

    const handleDeleteAccount = async () => {
        if (!isConfirmed || isDeleting) return;

        setIsDeleting(true);
        try {
            const response = await fetch("/api/users/me", {
                method: "DELETE",
            });

            if (!response.ok) {
                const body = (await response.json().catch(() => ({}))) as {
                    error?: string;
                    message?: string;
                };
                throw new Error(
                    (typeof body.error === "string" && body.error) ||
                        (typeof body.message === "string" && body.message) ||
                        "Failed to delete account"
                );
            }

            toast.success("Account deleted successfully. Logging out...");
            // Real deletion would redirect to logout or landing page
            setTimeout(() => {
                window.location.href = "/";
            }, 2000);
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to delete account");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="rounded-lg border border-destructive/30 bg-card overflow-hidden">
            <div className="border-b border-destructive/20 px-6 py-4 bg-destructive/5">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="text-destructive size-4" />
                    <h4 className="text-sm font-semibold text-destructive">Danger Zone</h4>
                </div>
            </div>
            <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-medium">Delete Account</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                </div>

                <AlertDialog open={open} onOpenChange={setOpen}>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="shrink-0 text-destructive-foreground">
                            Delete Account
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action will permanently delete your account, your organization settings, and all data associated with you. This cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="my-4 space-y-2">
                            <p className="text-xs text-muted-foreground">
                                To confirm, please type <span className="font-bold text-foreground">confirm delete</span> in the box below:
                            </p>
                            <Input
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="Type confirm delete to confirm"
                                className="border-destructive/50 focus-visible:ring-destructive"
                            />
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting} onClick={() => setConfirmText("")}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.preventDefault();
                                    void handleDeleteAccount();
                                }}
                                disabled={!isConfirmed || isDeleting}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="mr-2 animate-spin size-4" />
                                        Deleting...
                                    </>
                                ) : (
                                    "Delete Account"
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
