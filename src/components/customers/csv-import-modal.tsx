"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CsvImportModalPreview } from "./csv-import-modal-preview";
import { CsvImportModalUpload } from "./csv-import-modal-upload";
import type { CsvImportModalProps } from "./csv-import-modal-types";
import { useCsvImportModal } from "./use-csv-import-modal";

export function CSVImportModal(props: CsvImportModalProps) {
    const m = useCsvImportModal(props);

    return (
        <Dialog open={props.open} onOpenChange={m.handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Import Customers</DialogTitle>
                    <DialogDescription>Upload a CSV file. Required columns: name or email.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <CsvImportModalUpload
                        fileName={m.fileName}
                        fileInputRef={m.fileInputRef}
                        onFileSelect={m.handleFileSelect}
                    />
                    <CsvImportModalPreview
                        csvData={m.csvData}
                        hasConsent={m.hasConsent}
                        onConsentChange={m.setHasConsent}
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => props.onOpenChange(false)} disabled={m.isLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={m.handleImport}
                        disabled={m.isLoading || m.csvData.length === 0 || !m.hasConsent}
                    >
                        {m.isLoading ? <Loader2 className="mr-2 animate-spin size-4" /> : null}
                        {m.isLoading ? "Importing..." : "Import Customers"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
