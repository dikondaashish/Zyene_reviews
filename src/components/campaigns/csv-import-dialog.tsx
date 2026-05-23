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
import { CsvImportDialogMappingStep } from "./csv-import-dialog-mapping-step";
import { CsvImportDialogUploadStep } from "./csv-import-dialog-upload-step";
import type { CsvImportDialogProps } from "./csv-import-dialog-types";
import { useCsvImportDialog } from "./use-csv-import-dialog";

export function CSVImportDialog({ open, onOpenChange, onImport, isImporting }: CsvImportDialogProps) {
    const d = useCsvImportDialog({ onOpenChange, onImport });

    return (
        <Dialog open={open} onOpenChange={d.handleOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Import Contacts via CSV</DialogTitle>
                    <DialogDescription>Upload a CSV file and map columns to contact fields.</DialogDescription>
                </DialogHeader>

                {d.step === "upload" ? (
                    <CsvImportDialogUploadStep fileInputRef={d.fileInputRef} onFileChange={d.handleFileChange} />
                ) : (
                    <CsvImportDialogMappingStep
                        rowCount={d.csvData.length}
                        headers={d.headers}
                        mapping={d.mapping}
                        onMappingChange={(patch) => d.setMapping((prev) => ({ ...prev, ...patch }))}
                    />
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => (d.step === "mapping" ? d.setStep("upload") : onOpenChange(false))}
                    >
                        {d.step === "mapping" ? "Back" : "Cancel"}
                    </Button>
                    <Button
                        onClick={d.handleImport}
                        disabled={d.step === "upload" || isImporting || (!d.mapping.email && !d.mapping.phone)}
                    >
                        {isImporting ? (
                            <>
                                <Loader2 className="mr-2 animate-spin size-4" />
                                Importing...
                            </>
                        ) : (
                            `Import ${d.csvData.length} Contacts`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
