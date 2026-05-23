"use client";

import { AlertTriangle } from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function SlugEditorWarningDialog({
    open,
    onOpenChange,
    pendingSlug,
    initialSlug,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pendingSlug: string | null;
    initialSlug: string;
    onConfirm: () => void;
}) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive flex items-center gap-2">
                        <AlertTriangle className="size-5" />
                        Warning: Breaking Change
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Changing your link to <strong>zyenereviews.com/{pendingSlug}</strong> will break your current
                        link (<strong>zyenereviews.com/{initialSlug}</strong>).
                        <br />
                        <br />
                        Any existing QR codes or printed materials will stop working immediately. Are you sure you want
                        to continue?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} className="bg-destructive hover:bg-destructive/90">
                        Yes, Change Link
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
