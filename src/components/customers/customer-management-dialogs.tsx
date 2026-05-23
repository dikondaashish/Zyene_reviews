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
import { AddCustomerModal } from "@/components/customers/add-customer-modal";
import { CSVImportModal } from "@/components/customers/csv-import-modal";

export function CustomerManagementDialogs({
    businessId,
    bulkDeleteOpen,
    onBulkDeleteOpenChange,
    selectedIds,
    onBulkDeleteConfirm,
    isAddModalOpen,
    onAddModalOpenChange,
    onAddSuccess,
    isImportModalOpen,
    onImportModalOpenChange,
    onImportSuccess,
}: {
    businessId: string;
    bulkDeleteOpen: boolean;
    onBulkDeleteOpenChange: (open: boolean) => void;
    selectedIds: string[];
    onBulkDeleteConfirm: () => void;
    isAddModalOpen: boolean;
    onAddModalOpenChange: (open: boolean) => void;
    onAddSuccess: () => void;
    isImportModalOpen: boolean;
    onImportModalOpenChange: (open: boolean) => void;
    onImportSuccess: () => void;
}) {
    return (
        <>
            <AddCustomerModal
                open={isAddModalOpen}
                onOpenChange={onAddModalOpenChange}
                onSuccess={onAddSuccess}
                businessId={businessId}
            />
            <CSVImportModal
                open={isImportModalOpen}
                onOpenChange={onImportModalOpenChange}
                onSuccess={onImportSuccess}
            />

            <AlertDialog open={bulkDeleteOpen} onOpenChange={onBulkDeleteOpenChange}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedIds.length} customer(s)?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove the selected contacts from this business. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={onBulkDeleteConfirm}
                        >
                            Delete Selected
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
