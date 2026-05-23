"use client";

import { Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Competitor } from "./competitors-types";

type CompetitorsListDeleteDialogProps = {
    competitors: Competitor[];
    deleteConfirm: string | null;
    setDeleteConfirm: (id: string | null) => void;
    isDeleting: string | null;
    onDelete: (id: string) => void;
};

export function CompetitorsListDeleteDialog({
    competitors,
    deleteConfirm,
    setDeleteConfirm,
    isDeleting,
    onDelete,
}: CompetitorsListDeleteDialogProps) {
    return (
            <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Competitor</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove {competitors.find(c => c.id === deleteConfirm)?.name}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                        <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="w-full bg-destructive hover:bg-destructive/90 sm:w-auto"
                            disabled={isDeleting === deleteConfirm}
                            onClick={() => onDelete(deleteConfirm!)}
                        >
                            {isDeleting === deleteConfirm ? (
                                <>
                                    <Loader2 className="mr-2 animate-spin size-4" />
                                    Removing...
                                </>
                            ) : (
                                "Remove"
                            )}
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
    );
}
