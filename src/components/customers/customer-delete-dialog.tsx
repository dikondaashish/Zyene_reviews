"use client";

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
import { customerDisplayName, type Customer } from "@/components/customers/customer-table-types";

export function CustomerDeleteDialog({
    deleteTarget,
    onOpenChange,
    onConfirm,
}: {
    deleteTarget: Customer | null;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}) {
    return (
        <AlertDialog open={!!deleteTarget} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete this customer?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This removes{" "}
                        <span className="font-medium text-foreground">
                            {deleteTarget ? customerDisplayName(deleteTarget) || "this contact" : ""}
                        </span>{" "}
                        from your list. This cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={onConfirm}
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
